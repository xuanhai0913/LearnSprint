> **Historical R3 scope, superseded 2026-09-23:** the owner selected an operations-coordinator job simulation. Use the [current R4 plan](../career/PRODUCT-BRIEF.md). This file preserves earlier PowerLab scope/evidence and must not drive new feature work or be copied as the current submission story.

# Education AI landscape and product decision

Type: research/explanation. Revision 3. Reviewed 2026-09-23. This is a review of public primary sources, not hands-on benchmarking or a complete market census. Vendor announcements establish advertised capabilities; they do not establish availability for every account or independently measured effectiveness. Project pages contain their authors' claims.

## 1. Findings that change the plan

The market baseline is much stronger than a generic chatbot. Guided dialogue, uploaded course materials, adaptive lessons, progress views, voice and interactive diagrams already exist. Building any one of these does not establish differentiation. The product must solve a specific learning job with a better complete workflow, and demonstrate that advantage in observation.

### Established products

| Product / primary source | Documented strength | Consequence for LearnSprint / question still open |
| --- | --- | --- |
| [ChatGPT Study Mode](https://help.openai.com/en/articles/11780217-using-study-mode-in-chatgpt) and [interactive science explanations](https://openai.com/index/new-ways-to-learn-math-and-science-in-chatgpt/) | Guided questions, learning context, uploaded material and dynamic manipulation of mathematical/scientific variables | We cannot claim that ChatGPT only produces text. Compare against its current study tools, not an artificially weak prompt. Does a prepared design task with durable action evidence reduce learner setup and teacher review effort? |
| [Gemini study notebooks, June 25, 2026](https://blog.google/innovation-and-ai/products/gemini-app/gemini-study-notebooks/) | Course uploads, diagnostic quizzes, targeted lessons, objective-level progress and recommendations; integration with NotebookLM | A knowledge-gap dashboard and personalized plan are already established features. Our candidate advantage must appear in decisions and consequences inside a practical task. |
| [Gemini Guided Learning](https://blog.google/products-and-platforms/products/education/guided-learning/) | Multimodal guidance, visual material and interactive checks | Adding Socratic prompts is insufficient. The quality of the activity and its connection to a real learning objective matter. |
| [Khanmigo](https://www.khanmigo.ai/learners) and [August 27 classroom update](https://blog.google/products-and-platforms/products/education/khan-academy-back-to-school/) | Curriculum context, teacher workflows, adaptive interactive diagrams, teacher-reviewed practice and performance reports | We cannot claim teachers lack AI dashboards or that interactive diagrams are new. Investigate whether a short replay of a learner's design decisions is useful for a particular lesson. |
| [Brilliant](https://brilliant.org/ai/) | Carefully authored interactive problem solving, feedback and recommended progression | Treat lesson craft and direct manipulation as the usability baseline. A model-generated worksheet is not an improvement by itself. |
| [PhET research](https://phet.colorado.edu/en/research) and [PhET Studio](https://phet.colorado.edu/fa/studio/overview/faq) | Research-informed simulations; educator customization/presets and an established teaching ecosystem | Do not claim simulations or custom starting conditions are new. Public sims and instrumented PhET-iO/Studio have different licensing; build our small engine without copying their implementation/assets. |
| [Labster](https://www.labster.com/) | Immersive scientific tasks, a large lab catalog, assessment/reporting and institutional integration | Real-world scenarios plus a lab assistant already exist. Competing on catalog size or 3D production is unrealistic. Explore a lightweight, voice-operated design exercise that fits a short tutorial. |
| [Duolingo Video Call](https://blog.duolingo.com/video-call/) | Repeated, contextual spoken practice integrated into a learning path | Voice must perform useful work and preserve continuity. A microphone attached to a text tutor is weak differentiation. |

The questions in the last column are our hypotheses, not claims that these products cannot support the proposed workflow. We have not purchased or exhausted every competing product's capabilities.

### Public hackathon precedents

| Project / primary source | What its page describes | Implication |
| --- | --- | --- |
| [CounterWorlds](https://devpost.com/software/counterworlds) | Classroom misconceptions represented as competing interactive models, prediction, experiment and revision | A pitch based on turning misconceptions into worlds has direct prior art. Do not use that as our originality claim. |
| [WrongWorlds](https://devpost.com/software/wrongworlds) | A reasoning game with deterministic evidence, model interpretation and a different transfer problem | Deterministic verification and transfer are useful design choices, but their combination is not unprecedented. |
| [OmniCanvas](https://devpost.com/software/omnicanvas) | Source-linked STEM material, spatial organization, review questions and playable simulations | Upload-to-visual-learning is also crowded. The indexed project description was readable; a direct page fetch was limited, so treat this row as author-reported positioning. |
| [SOLTutor.ai](https://devpost.com/software/soltutor-ai) | Curriculum practice, misconception feedback and teacher insight | A teacher insight screen alone cannot carry our innovation claim. Direct page retrieval was limited; this row uses the indexed author description. |

These are precedents, not a verified list of rivals in our Amazon competition, prize winners, or independently audited shipped products. No code, branding, story or assets from them are incorporated into LearnSprint.

## 2. The opportunity we will investigate

**A student can follow an explanation but has difficulty planning a useful system under several constraints; a tutor sees the final answer without seeing which decisions caused the failure.**

Our proposed experience joins a small authored design lab, conversational tool control, targeted experiments, a changed constraint, and a replayable record for a tutor. The first artifact is an energy-use schedule for a fictional study hub. The student must preserve useful services while respecting both energy capacity and instantaneous power. Multiple solutions work.

The potential advantage is a complete, ready-to-use lesson with inspectable action evidence and continuity. It is not a claim of scientific novelty or that a general assistant cannot reproduce the workflow with sufficient setup. We must find out whether this reduces friction and helps students apply the distinction between power and energy.

## 3. Alternatives considered

These are qualitative product judgments, not official judging scores.

| Direction | Audience / practical value | Differentiation and delivery risk | Decision |
| --- | --- | --- | --- |
| General AI tutor + PDF + quizzes | Broad student audience | Direct competition with much stronger established platforms; difficult to demonstrate distinct value | Reject as the central pitch |
| Continue API permissions missions | Junior developers; existing code accelerates delivery | Useful educational exercise, but narrower public story and no validated demand yet | Preserve prototype; move out of the submission's hero journey |
| Misconception worlds / interactive textbook | STEM learners | Strong direct prior art; temptation to overclaim arbitrary generation | Use established learning techniques where helpful, not this positioning |
| Voice-operated practical STEM design lab | Introductory college / adult vocational learners and their tutors | Concrete artifact, visually legible consequences and a natural Alexa-style workflow; content and voice reliability need early work | Recommended R3 direction |
| Full adaptive curriculum / institutional LMS | Institutions | Too much authoring, integration and procurement work before October 22 | Post-hackathon only, if demand appears |

Energy literacy is the initial lesson because the core concepts have authoritative explanations, the system can be evaluated with transparent equations, the task is understandable in a short demo, and the result connects classroom knowledge to everyday decisions. It is a product choice, not a mandated hackathon topic.

## 4. Learning research and the limits of inference

- [Bastani et al., PNAS (2025)](https://doi.org/10.1073/pnas.2422633122) studied generative AI assistance in a specific high-school mathematics setting. The distinction between assisted performance and subsequent unaided performance motivates a separate transfer attempt. It does not prove that all AI tutoring is harmful or that LearnSprint works.
- [Kestin et al., Scientific Reports (2025)](https://www.nature.com/articles/s41598-025-97652-6) report a randomized study of a structured AI tutor in an undergraduate physics course, with 194 eligible students. The context-specific result supports careful instructional design; it does not establish our effectiveness or eliminate the need for instructors.
- [PhET's research account](https://phet.colorado.edu/en/research) emphasizes simulation design, interviews and the role of activity framing. A manipulable diagram alone does not ensure productive learning; simulations also do not replace every objective of physical labs.

Our design inference: give a meaningful task, elicit a short prediction, expose a relevant consequence, offer bounded help and observe a changed task with help recorded. Measure delayed performance separately. Do not turn confidence, enjoyment or completion into a claim of mastery.

## 5. What could make this direction fail?

1. Learners see it as a scheduling puzzle with little connection to their coursework.
2. The tutor is slower than direct manipulation, or frequently mishears numerical commands.
3. Students pass by trial and error without using the intended concepts.
4. A teacher finds the evidence packet too long or too ambiguous to help.
5. A strong ChatGPT/Gemini-assisted use of the same lab is equally effective and easier.
6. The chosen first audience cannot be reached in time for an honest pilot.

Countermeasures are in the [research protocol](USER-RESEARCH.md). Feature count is not a substitute for resolving these risks. The [product brief](../product/PRODUCT-BRIEF.md) is the recommended plan, and the [judging evidence map](../hackathon/JUDGING-EVIDENCE.md) explains how to make its strengths reviewable.
