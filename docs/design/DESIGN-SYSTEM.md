# Design system

Type: reference. Version 0.3, target for the PowerLab education release. Practice-A screens now implement the palette, original study-hub illustration, native schedule controls, outcomes and comparison. Runtime visual/accessibility acceptance remains pending; coach/voice/B/C/report screens remain planned. [Local implementation](../engineering/POWERLAB-LOCAL.md).

## Direction — a practical learning studio

Retain warm paper, dark ink, fine rules and restrained green accents. Center the useful artifact: a device-use schedule, its constraints and visible consequences. A small original study-hub illustration connects each device to its row. A compact rail follows Plan → Explore → Apply → Review.

Give energy and power clearly different labels/units and line styles, with an equivalent table. Use factual progress and short activity cards. Saved state, live provider mode and feasibility are distinct concepts. Decorative mastery rings and a long chat transcript do not belong at the center.

## Color tokens

| Token | Proposed value | Intended use |
| --- | --- | --- |
| `color.canvas` | `#F6F3EC` | Page background |
| `color.surface` | `#FFFEFA` | Workbench and source surfaces |
| `color.surface-muted` | `#EBE8DF` | Recessed panels |
| `color.ink` | `#172C29` | Main text |
| `color.ink-muted` | `#52645E` | Supporting text |
| `color.border` | `#CBCFC4` | Decorative rules and separators |
| `color.border-strong` | `#697C73` | Input boundaries where required |
| `color.accent` | `#215C43` | Primary action and current step |
| `color.on-accent` | `#FFFFFF` | Primary button label |
| `color.accent-soft` | `#E0EBDD` | Selected or completed background |
| `color.warning` | `#79501C` | Partial understanding / warning text |
| `color.warning-soft` | `#F6E8CF` | Warning background |
| `color.danger` | `#A3342A` | Error text and destructive action |
| `color.danger-soft` | `#F8E4DE` | Error background |
| `color.focus` | `#155FAD` | Focus ring |

Implementation must measure contrast for every text/background and interactive-state pair. Target WCAG AA: 4.5:1 normal text, 3:1 large text and relevant non-text controls. Token selection alone is not proof of compliance. Never use color as the only outcome indicator.

## Typography

- Display candidate: **Newsreader** or a comparable readable editorial serif; fallback `Georgia, serif`.
- UI/body candidate: **Source Sans 3**; system sans fallback if font loading fails.
- Technical tokens and examples: `ui-monospace, monospace`.
- Verify font license and distribution method before bundling. A system fallback is acceptable for the first functional slice.

| Role | Size / line height | Weight |
| --- | --- | --- |
| Display | 40/46px desktop, 32/38px mobile | 500 |
| Page title | 28/34px | 600 |
| Section title | 22/28px | 600 |
| Mission prompt | 24/34px | 500 |
| Body | 18/28px | 400 |
| UI control | 16/22px | 600 |
| Supporting text | 14/20px | 400 |
| Eyebrow | 12/18px | 600 |

Avoid uppercase long sentences. Keep educational passages around 55–75 characters per line. Technical examples preserve whitespace and wrap or scroll locally without overflowing the page.

## Space, shape and elevation

- Base spacing scale in pixels: `4, 8, 12, 16, 24, 32, 48, 64`.
- Control radius: 8px. Main content radius: 16px. Chips: fully rounded.
- Desktop page gutter: 32px; tablet: 24px; mobile: 16px.
- Content maximum width: 1200px; central explanation column: approximately 680px.
- Border: 1px for ordinary separators; 2px for selected interactive boundaries.
- Shadow: subtle, reserved for popovers and source drawers. Use borders for ordinary content grouping.
- Touch target design target: at least 44×44px.

## Layout and breakpoints

| Width | Behavior |
| --- | --- |
| Below 640px | Single column; source panel becomes a bottom sheet; session rail becomes a compact header |
| 640–1023px | Practice workspace plus collapsible secondary panel |
| 1024px and above | Session rail + practice workspace + optional source/progress panel |

These are implementation defaults, not device assumptions. Check text zoom and translated/long text. Place mobile controls above safe-area insets and ensure the keyboard does not cover focused input.

## Core components

| Component | Required behavior |
| --- | --- |
| Lesson / resume card | Supported lesson, clear goal, exact unfinished artifact and reason |
| Brief card | W/Wh limits, duration, service requirements, changed conditions |
| Study-hub illustration | Original art; device/row mapping; accessible text equivalent |
| Schedule grid | Labeled device/hour toggles; keyboard and pointer; optional drag enhancement |
| Run / receipt | Current revision, requested energy, peak power and all service constraints |
| Timeline / comparison | Units, readable legend, two revisions, equivalent table; no fake measurements |
| Coach activity | Actual evidence, one helpful next action, source, live/authored/error state |
| Voice dock | Explicit listening, recognized command, result/undo, stop and recovery |
| Transfer / review banner | Independent/assisted state, changed brief and actual elapsed time |
| Evidence report | Plan, runs, assistance, uncertainty; owner preview and scoped sharing |
| Save/conflict alert | Draft vs saved vs error; preserve work and explain recovery |
| Demo information | Alexa+ simulation label, actual provider state and release boundaries |

All controls need hover/focus/busy/disabled states without unstable labels. Results use text, units and shape as well as color. Never imply that saving a plan means its constraints pass.

## Voice interaction

No automatic listening. A clearly labeled push-to-talk button requests microphone access only when selected. Distinguish `idle`, `requesting permission`, `listening`, `transcribing`, `review transcript`, `speaking` and `error`.

Show recognized commands. Ask for clarification or confirmation for ambiguous/broad edits; specific reversible commands may apply with an immediate undo. Provide “Stop listening” and “Stop speaking.” Never display an animated waveform that falsely suggests recording. A microphone error must not disable text entry.

## Motion and accessibility

- 120–180ms for control transitions, 180–240ms for panel transitions.
- No delayed entrance animation on the schedule controls or keyboard focus targets.
- Honor reduced-motion preferences; replace movement with immediate state changes.
- Use native controls first, visible focus rings, associated labels and logical tab order.
- Announce concise status changes via a polite live region; do not announce every generated token.
- Never move focus merely because a model response arrived. Move it after an explicit navigation action when appropriate.
- Preserve readable feedback until the learner chooses the next step.

## Copy and brand boundaries

Use “Saved”, “Not saved yet”, “Continue session”, “Show source” and “Try another example.” Avoid technical tool names in the learner journey unless needed to explain a decision.

Show “Alexa+ experience simulation” on the demo information surface. Do not use an Amazon/Alexa logo as LearnSprint branding or imply certification. The product wordmark can remain text-only for the MVP.

## Definition of design readiness

Before visual polish: all essential screens have loading, empty, error and saved/unsaved behavior; keyboard/control-based use is complete; source viewing, transfer, resume and report privacy work. Then verify color contrast, keyboard flow, mobile layout and actual voice permissions as part of an explicitly requested review.
