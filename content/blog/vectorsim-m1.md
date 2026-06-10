---
id: vectorsim-m1
title: VectorSim: Milestone 1
date: 2026-02-18
excerpt: Initial simulation baseline and test harness are in place. Next update will include comparison plots and control response notes.
tags: ["simulation", "update"]
relatedProject: vectorsim
---
Initial simulation baseline and test harness are in place.

- Core 6-DOF rigid body integrator running with RK4 and simple Euler cross-checks.
- Thrust vector math and nozzle geometry abstractions landed; actuator models stubbed for now.
- Test harness spins up deterministic scenarios from YAML-style case files and logs time-series to CSV.
- Basic logging + replay script lets me diff two runs quickly in the terminal.

Next update will include comparison plots (actual vs. commanded trajectories) and early control response notes once the first PD loop closes the loop in sim. The immediate focus is making the scenario runner robust so every new control idea can be dropped in without rewriting harness code.
