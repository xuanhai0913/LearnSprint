# PowerLab content

`pack.json` selects the active immutable version in `versions/`. Version 0.1.0 contains practice A only. The B/C scenarios in the product plan remain future work.

Stories, fictional ratings, service requirements, wording and artwork are authored for LearnSprint. The EIA link supplies the definitions of electricity units; it does not endorse or validate the lesson.

`reference-values.json` records separately authored expected values. Production code does **not** read that file or use its answers to decide feasibility. A learner's plan passes if all numerical and service constraints pass, including exact limits. These reference values are not a claim that automated or browser acceptance checks have run.

Keep a used version unchanged. Add a version and update the manifest when changing its educational or physical assumptions. Existing sessions continue using their pinned version. Subject-expert review is still pending.
