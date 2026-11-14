---
title: Kalman filter
updated: 2026-10-31
order: 2
draft: true
---

## Model

The filter assumes a linear system with Gaussian noise:

$$
x_k = F_k x_{k-1} + B_k u_k + w_k, \qquad w_k \sim \mathcal{N}(0, Q_k)
$$

$$
z_k = H_k x_k + v_k, \qquad v_k \sim \mathcal{N}(0, R_k)
$$

It keeps an estimate $\hat{x}$ and its covariance $P$.

## Predict

$$
\hat{x}_{k|k-1} = F_k \hat{x}_{k-1|k-1} + B_k u_k
$$

$$
P_{k|k-1} = F_k P_{k-1|k-1} F_k^\top + Q_k
$$

## Update

$$
y_k = z_k - H_k \hat{x}_{k|k-1}, \qquad S_k = H_k P_{k|k-1} H_k^\top + R_k
$$

$$
K_k = P_{k|k-1} H_k^\top S_k^{-1}
$$

$$
\hat{x}_{k|k} = \hat{x}_{k|k-1} + K_k y_k, \qquad P_{k|k} = (I - K_k H_k) P_{k|k-1}
$$

### Joseph form

The short covariance update above can lose symmetry and positive definiteness in floating point. The Joseph form is more robust:

$$
P_{k|k} = (I - K_k H_k) P_{k|k-1} (I - K_k H_k)^\top + K_k R_k K_k^\top
$$

## Code

```python
import numpy as np

def predict(x, P, F, Q):
    return F @ x, F @ P @ F.T + Q

def update(x, P, z, H, R):
    y = z - H @ x
    S = H @ P @ H.T + R
    K = np.linalg.solve(S, H @ P).T
    I_KH = np.eye(len(x)) - K @ H
    return x + K @ y, I_KH @ P @ I_KH.T + K @ R @ K.T
```
