import io
import torch
import torchaudio
import numpy as np
import librosa

def load_and_preprocess_audio(file_bytes: bytes, target_sr: int = 16000) -> torch.Tensor:
    """
    Standardized Audio Pipeline:
    1. Validation
    2. Decode WAV/MP3/M4A/FLAC/OGG
    3. Mono conversion
    4. 16kHz resampling
    5. Noise gate & silence trimming
    6. Peak normalization to [-0.95, +0.95]
    """
    try:
        # Load audio using torchaudio or soundfile
        audio_stream = io.BytesIO(file_bytes)
        waveform, sr = torchaudio.load(audio_stream)
    except Exception:
        # Fallback to librosa
        audio_stream = io.BytesIO(file_bytes)
        y, sr = librosa.load(audio_stream, sr=None, mono=False)
        waveform = torch.from_numpy(y)
        if waveform.dim() == 1:
            waveform = waveform.unsqueeze(0)

    # 1. Multi-channel to Mono
    if waveform.shape[0] > 1:
        waveform = torch.mean(waveform, dim=0, keepdim=True)

    # 2. Resample to 16,000 Hz
    if sr != target_sr:
        resampler = torchaudio.transforms.Resample(orig_freq=sr, new_freq=target_sr)
        waveform = resampler(waveform)

    # 3. Silence Trimming (RMS energy threshold)
    samples = waveform.squeeze(0).numpy()
    trimmed_samples, _ = librosa.effects.trim(samples, top_db=30)
    if len(trimmed_samples) == 0:
        trimmed_samples = samples

    # 4. Peak Normalization
    peak = np.max(np.abs(trimmed_samples))
    if peak > 1e-4:
        trimmed_samples = (trimmed_samples / peak) * 0.95

    # Target length pad/crop (approx 3.0s to 4.0s = 64,000 samples)
    target_samples = 64000
    if len(trimmed_samples) < target_samples:
        # Repeat or zero-pad
        num_repeats = int(np.ceil(target_samples / len(trimmed_samples)))
        padded = np.tile(trimmed_samples, num_repeats)[:target_samples]
    else:
        padded = trimmed_samples[:target_samples]

    tensor = torch.from_numpy(padded).float().unsqueeze(0) # [1, 64000]
    return tensor
