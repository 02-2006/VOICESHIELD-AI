import numpy as np

def compute_eer(bonafide_scores: np.ndarray, spoof_scores: np.ndarray) -> tuple[float, float]:
    """
    Computes Equal Error Rate (EER) and the corresponding decision threshold
    Conforms to ASVspoof challenge evaluation protocols.
    """
    scores = np.concatenate((bonafide_scores, spoof_scores))
    labels = np.concatenate((np.ones_like(bonafide_scores), np.zeros_like(spoof_scores)))

    thresholds = np.sort(scores)
    frr = np.zeros(len(thresholds))
    far = np.zeros(len(thresholds))

    for i, threshold in enumerate(thresholds):
        frr[i] = np.mean(bonafide_scores < threshold)
        far[i] = np.mean(spoof_scores >= threshold)

    abs_diffs = np.abs(frr - far)
    min_idx = np.argmin(abs_diffs)

    eer = (frr[min_idx] + far[min_idx]) / 2.0
    eer_threshold = thresholds[min_idx]

    return eer, eer_threshold
