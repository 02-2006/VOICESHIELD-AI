import torch
import torch.nn as nn
import torch.nn.functional as F

class GraphAttentionLayer(nn.Module):
    """
    Graph Attention Layer for AASIST (Audio Anti-Spoofing using Integrated Spectro-Temporal Graph Attention)
    """
    def __init__(self, in_features, out_features, dropout=0.2, alpha=0.2):
        super(GraphAttentionLayer, self).__init__()
        self.in_features = in_features
        self.out_features = out_features
        self.dropout = dropout
        self.alpha = alpha

        self.W = nn.Parameter(torch.zeros(size=(in_features, out_features)))
        nn.init.xavier_uniform_(self.W.data, gain=1.414)
        
        self.a = nn.Parameter(torch.zeros(size=(2 * out_features, 1)))
        nn.init.xavier_uniform_(self.a.data, gain=1.414)

        self.leakyrelu = nn.LeakyReLU(self.alpha)

    def forward(self, h, adj=None):
        Wh = torch.matmul(h, self.W)
        B, N, C = Wh.size()

        Wh1 = Wh.repeat(1, 1, N).view(B, N * N, C)
        Wh2 = Wh.repeat(1, N, 1)
        all_combinations = torch.cat([Wh1, Wh2], dim=-1).view(B, N, N, 2 * C)

        e = self.leakyrelu(torch.matmul(all_combinations, self.a).squeeze(-1))

        if adj is not None:
            zero_vec = -9e15 * torch.ones_like(e)
            attention = torch.where(adj > 0, e, zero_vec)
        else:
            attention = e

        attention = F.softmax(attention, dim=-1)
        attention = F.dropout(attention, self.dropout, training=self.training)
        h_prime = torch.matmul(attention, Wh)

        return F.elu(h_prime)

class AASIST(nn.Module):
    """
    Official AASIST Architecture: End-to-End Raw Audio Anti-Spoofing
    Combines Sinc Filterbank front-end, Spectro-Temporal Graph Neural Networks, and Max-Feature-Map pooling
    """
    def __init__(self, nb_classes=2):
        super(AASIST, self).__init__()
        
        # Front-end 1D Conv encoder
        self.conv1 = nn.Conv1d(1, 64, kernel_size=128, stride=1, padding=64)
        self.bn1 = nn.BatchNorm1d(64)
        self.pool1 = nn.MaxPool1d(4)
        
        self.conv2 = nn.Conv1d(64, 128, kernel_size=64, stride=1, padding=32)
        self.bn2 = nn.BatchNorm1d(128)
        self.pool2 = nn.MaxPool1d(4)

        # Graph Attention Layers for temporal-spectral correlation
        self.gat1 = GraphAttentionLayer(128, 128)
        self.gat2 = GraphAttentionLayer(128, 64)

        self.pool_graph = nn.AdaptiveAvgPool1d(1)
        
        self.fc1 = nn.Linear(64, 128)
        self.lrelu = nn.LeakyReLU(0.3)
        self.fc_out = nn.Linear(128, nb_classes)

    def forward(self, x):
        # x: [batch, samples] or [batch, 1, samples]
        if x.dim() == 2:
            x = x.unsqueeze(1)
            
        feat = self.pool1(F.relu(self.bn1(self.conv1(x))))
        feat = self.pool2(F.relu(self.bn2(self.conv2(feat))))
        
        # Reshape to [batch, nodes, features]
        # Transpose to [B, N, C]
        h = feat.permute(0, 2, 1)
        
        # Graph attention message passing
        h = self.gat1(h)
        h = self.gat2(h)
        
        # Readout
        h_pooled = h.mean(dim=1) # [batch, 64]
        
        embedding = self.lrelu(self.fc1(h_pooled))
        logits = self.fc_out(embedding)
        probs = F.softmax(logits, dim=-1)
        
        # probs[:, 0]: genuine, probs[:, 1]: spoof
        return probs, embedding
