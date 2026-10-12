# 4A0X1 rework — design thesis: "The quiet desk"

## What this is
CDC exam prep for the 4A0X1 career field. 200 practice questions across 5-level
and 7-level modules. Modes: study (instant feedback), test (results at end),
random mix, missed-only, favorites, unseen, bookmarked review. Progress tracking
per question (seen / mastered / missed), per-module readiness, streaks.
Lineage: Quizlet — flashcard-like cards, learn/test modes, review queues. The
interaction patterns stay familiar; the visual system gets rebuilt.

## What was wrong (Hans's verdict on the previous redesign)
1. Sidebar scrolled with the page instead of staying put.
2. Color choice was weird — the "mission brief" military theme (brass, pine,
   brick on parchment, condensed type, "Ready for today's drill").
3. The entire UI/UX needed a rethink.

## Why the military theme failed
Hans wears the uniform all day. Dressing his study app like a briefing room is
costume, and it fights the actual job: long, late, tired-eyes reading sessions.
The theme added visual noise (condensed display type, kickers, brass accents
everywhere) exactly where the eye needed rest.

## Thesis
The app should feel like the best physical study setup: a clean desk, warm
paper, one good pen. Nothing shouts. The question is always the hero; chrome
recedes.

## Decisions
1. **Palette — paper, not parchment.** Warm off-white `#F8F5EE`, surfaces a
   breath lighter, hairline warm-gray borders. Ink is warm charcoal `#201D17`,
   never pure black. One accent: fountain-pen blue `#2C4A73`, used sparingly.
   Green/red exist only for correct/incorrect and are desaturated. Dark mode is
   a warm night desk (`#171512`), not blue-black.
2. **Type — set for reading.** Newsreader (serif) for question stems and
   display headings: reads like a well-set textbook. Barlow for UI chrome.
   IBM Plex Mono for data labels. Condensed type removed entirely.
3. **Sidebar — stays put.** `position: sticky; top: 0; height: 100vh` with its
   own scroll. Independent of page scroll on desktop; bottom nav on mobile.
4. **Session chrome recedes.** Hairline progress, quiet header. The question
   card carries the visual weight; answers are calm rows until they matter.
5. **Copy — plainspoken.** No drill, no mission, no brief. Labels say what
   things are. No AI-signature phrasing anywhere.

## Validation
Representative screen (quiz session) built and screenshot-reviewed at 390px and
1280px before scaling. Full pass over every screen after. Real-device review
by Hans remains the final gate.
