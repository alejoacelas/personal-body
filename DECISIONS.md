# Health collection decisions

## Core decisions

### Preserve context and evidence limits

- [Keep body and mind research together without losing either source](#keep-body-and-mind-research-together-without-losing-either-source).
- [Keep evidence tiers and clinical review boundaries attached to conclusions](#keep-evidence-tiers-and-clinical-review-boundaries-attached-to-conclusions).
- [Keep meals and mood as independent repositories](#keep-meals-and-mood-as-independent-repositories).

## Details

### Keep body and mind research together without losing either source

The health merge preserved both histories and original seed prompts. [README.md](README.md) links food, meals, exercise framing and mood. Keep distinct questions and source evidence visible rather than flattening them into a single generic wellness plan.

### Keep evidence tiers and clinical review boundaries attached to conclusions

[Food evidence](food/evidence.md) distinguishes outcome trials, observational findings and inference. Preserve those qualifications when reusing the notes; do not turn research framing into an agreed personal treatment plan.

### Keep meals and mood as independent repositories

The [meals index](meals/README.md) is linked here but excluded by [.gitignore](.gitignore), following `606d2e2`. Maintain its catalog and app in that checkout rather than absorbing its files into health history.

[Mood](mood/README.md) holds bipolar II episodes, medication research and light notes in the private `alejoacelas/personal-mood`, also excluded here. This repository is public, and the episode history names other people and records employer events. Put new bipolar material there, not here.
