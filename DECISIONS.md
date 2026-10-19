# Health collection decisions

## Core decisions

### Preserve context and evidence limits

- [Keep body and mind research together without losing either source](#keep-body-and-mind-research-together-without-losing-either-source).
- [Keep evidence tiers and clinical review boundaries attached to conclusions](#keep-evidence-tiers-and-clinical-review-boundaries-attached-to-conclusions).
- [Keep mood as an independent private repository](#keep-mood-as-an-independent-private-repository).

## Details

### Keep body and mind research together without losing either source

The health merge preserved both histories and original seed prompts. [README.md](README.md) links exercise framing and mood. Keep distinct questions and source evidence visible rather than flattening them into a single generic wellness plan.

### Keep evidence tiers and clinical review boundaries attached to conclusions

Distinguish outcome trials, observational findings and inference, as the [diet research evidence guide](../meals/diet-research/evidence.md) does. Preserve those qualifications when reusing the notes; do not turn research framing into an agreed personal treatment plan.

### Keep mood as an independent private repository

[Mood](mood/README.md) holds bipolar II episodes, medication research and light notes in the private `alejoacelas/personal-mood`, also excluded here. This repository is public, and the episode history names other people and records employer events. Put new bipolar material there, not here.

## Log

- 2026-10-19: Moved `food/` to `me/meals/diet-research` (its own repository, history extracted with `git subtree split`) and the meals checkout from `meals/` to `me/meals/recipe-catalog`, so everything about eating sits in one place outside health.
