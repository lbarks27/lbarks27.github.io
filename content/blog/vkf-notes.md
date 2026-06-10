---
id: vkf-notes
title: Visual Kalman Filter Progress Notes
date: 2026-02-14
excerpt: Estimator pipeline scaffolding is complete; upcoming work focuses on measurement model validation and robustness testing.
tags: ["estimation", "controls"]
relatedProject: visual-kalman-filter
---
Estimator pipeline scaffolding is complete.

The current skeleton wires a constant-velocity motion model to a simple pinhole camera measurement model. State vector is 6-D (position + velocity); measurements are 2-D image-plane observations with synthetic noise.

Upcoming work:
- Validate the measurement Jacobian against finite differences on several trajectories.
- Add outlier rejection (Mahalanobis gating) and test sensitivity to bad tracks.
- Run Monte-Carlo trials to quantify steady-state covariance vs. process/measurement tuning.

Robustness testing will use both synthetic sequences and a small set of hand-labeled real video clips from the lab rig. Goal is a filter that degrades gracefully when feature tracks are sparse or biased.
