---
title: PID control
updated: 2026-10-30
order: 6
draft: true
---

## The control law

With error $e(t) = r(t) - y(t)$:

$$
u(t) = K_p \, e(t) + K_i \int_0^t e(\tau) \, d\tau + K_d \, \frac{de(t)}{dt}
$$

- **P** reacts to the present error.
- **I** removes steady-state error.
- **D** adds damping.

## Discrete form

With sample time $T$:

$$
u_k = K_p e_k + K_i T \sum_{j=0}^{k} e_j + K_d \frac{e_k - e_{k-1}}{T}
$$

## Practical fixes

### Derivative on measurement

A step in the setpoint makes $de/dt$ very large for one sample. Differentiate $-y$ instead of $e$ to prevent this "derivative kick".

### Integrator anti-windup

When the actuator saturates, the integrator keeps growing and causes overshoot. Stop integrating while the output is saturated:

```python
def pid_step(e, y, y_prev, state, kp, ki, kd, dt, u_min, u_max):
    d = -(y - y_prev) / dt
    u = kp * e + state["i"] + kd * d
    if u_min < u < u_max:
        state["i"] += ki * e * dt
    return min(max(u, u_min), u_max)
```
