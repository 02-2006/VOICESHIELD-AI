import torch
import torch.nn as nn
import torch.nn.functional as F
import numpy as np
import math

class SincConv(nn.Module):
    """
    Sinc-based convolution layer directly operating on raw 16kHz audio waveforms
    """
    @classmethod
    def to_mel(cls, hz):
        return 2595 * np.log10(1 + hz / 700)

    @classmethod
    def to_hz(cls, mel):
        return 700 * (10 ** (mel / 2595) - 1)

    def __init__(self, out_channels, kernel_size, sample_rate=16000, in_channels=1,
                 stride=1, padding=0, dilation=1, bias=False, groups=1, min_low_hz=50, min_band_hz=50):
        super(SincConv, self).__init__()
        if in_channels != 1:
            raise ValueError(f"SincConv only supports in_channels = 1, got {in_channels}")

        self.out_channels = out_channels
        self.kernel_size = kernel_size
        if kernel_size % 2 == 0:
            self.kernel_size = kernel_size + 1

        self.stride = stride
        self.padding = padding
        self.dilation = dilation
        self.sample_rate = sample_rate
        self.min_low_hz = min_low_hz
        self.min_band_hz = min_band_hz

        # Initialize filterbanks in Mel scale
        low_hz = 30
        high_hz = self.sample_rate / 2 - (self.min_low_hz + self.min_band_hz)
        mel = np.linspace(self.to_mel(low_hz), self.to_mel(high_hz), self.out_channels + 1)
        hz = self.to_hz(mel)

        self.low_hz_ = nn.Parameter(torch.Tensor(hz[:-1]).view(-1, 1))
        self.band_hz_ = nn.Parameter(torch.Tensor(np.diff(hz)).view(-1, 1))

        # Hamming window
        n_lin = torch.linspace(0, (self.kernel_size / 2) - 1, steps=int((self.kernel_size / 2)))
        self.window_ = 0.54 - 0.46 * torch.cos(2 * math.pi * n_lin / self.kernel_size)

        n_ = 2 * math.pi * torch.arange(-(self.kernel_size - 1) / 2.0, 0).view(1, -1) / self.sample_rate
        self.register_buffer('n_', n_)

    def forward(self, waveforms):
        self.n_ = self.n_.to(waveforms.device)
        self.window_ = self.window_.to(waveforms.device)

        low = self.min_low_hz + torch.abs(self.low_hz_)
        high = torch.clamp(low + self.min_band_hz + torch.abs(self.band_hz_), self.min_low_hz, self.sample_rate / 2)
        band = (high - low)[:, 0]

        f_times_t_low = torch.matmul(low, self.n_)
        f_times_t_high = torch.matmul(high, self.n_)

        band_pass_left = ((torch.sin(f_times_t_high) - torch.sin(f_times_t_low)) / (self.n_ / 2)) * self.window_
        band_pass_center = 2 * band.view(-1, 1)
        band_pass_right = torch.flip(band_pass_left, dims=[1])

        band_pass = torch.cat([band_pass_left, band_pass_center, band_pass_right], dim=1)
        band_pass = band_pass / (2 * band[:, None])

        self.filters = (band_pass).view(self.out_channels, 1, self.kernel_size)
        return F.conv1d(waveforms, self.filters, stride=self.stride, padding=self.padding, dilation=self.dilation, bias=None, groups=1)

class ResidualBlock(nn.Module):
    def __init__(self, in_channels, out_channels):
        super(ResidualBlock, self).__init__()
        self.bn1 = nn.BatchNorm1d(in_channels)
        self.lrelu = nn.LeakyReLU(0.3)
        self.conv1 = nn.Conv1d(in_channels, out_channels, kernel_size=3, padding=1)
        self.bn2 = nn.BatchNorm1d(out_channels)
        self.conv2 = nn.Conv1d(out_channels, out_channels, kernel_size=3, padding=1)
        self.pool = nn.MaxPool1d(kernel_size=3)
        self.downsample = nn.Conv1d(in_channels, out_channels, kernel_size=1) if in_channels != out_channels else None

    def forward(self, x):
        residual = x
        out = self.conv1(self.lrelu(self.bn1(x)))
        out = self.conv2(self.lrelu(self.bn2(out)))
        if self.downsample is not None:
            residual = self.downsample(residual)
        out = self.pool(out + residual)
        return out

class RawNet2(nn.Module):
    """
    Official RawNet2 Anti-Spoofing Architecture for Raw Audio Waveforms
    """
    def __init__(self, nb_classes=2):
        super(RawNet2, self).__init__()
        self.first_conv = SincConv(out_channels=128, kernel_size=1024, in_channels=1)
        self.first_bn = nn.BatchNorm1d(128)
        self.lrelu = nn.LeakyReLU(0.3)
        self.maxpool = nn.MaxPool1d(3)

        self.res1 = ResidualBlock(128, 128)
        self.res2 = ResidualBlock(128, 256)
        self.res3 = ResidualBlock(256, 512)

        self.gru = nn.GRU(input_size=512, hidden_size=1024, num_layers=2, batch_first=True)
        self.fc1 = nn.Linear(1024, 512)
        self.fc2 = nn.Linear(512, nb_classes)

    def forward(self, x):
        # x shape: [batch, 1, num_samples]
        if x.dim() == 2:
            x = x.unsqueeze(1)
        
        out = self.maxpool(self.lrelu(self.first_bn(self.first_conv(x))))
        out = self.res1(out)
        out = self.res2(out)
        out = self.res3(out)
        
        # [batch, channels, time] -> [batch, time, channels]
        out = out.permute(0, 2, 1)
        gru_out, _ = self.gru(out)
        feat = gru_out[:, -1, :] # Last hidden state
        
        dense = self.lrelu(self.fc1(feat))
        logits = self.fc2(dense)
        probs = F.softmax(logits, dim=-1)
        
        # probs[:, 0]: genuine probability, probs[:, 1]: spoof probability
        return probs, feat
