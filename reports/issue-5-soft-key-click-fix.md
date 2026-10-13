# Report: Soft-key click handling fix

Date: 2026-10-13
Issue: [#5 — On-screen F1–F5 soft keys do not respond to clicks](https://github.com/chriseatontx/wolfcalc/issues/5)

## Findings

Confirmed the bug on the live calculator: the keypad MODE control toggled DEG/RAD, but clicking F1 did not. The source showed the click handler was attached only to `#button-grid`; the F1–F5 controls are in a sibling container and never reached the activation handler.

## Changes

- Added shared action-button click delegation scoped to the calculator shell.
- Routed all clicks within the shell through the existing `activate()` behavior, preserving keypad handling and ignoring buttons outside the calculator.
- Added individual regression tests for F1, F2, F3, F4, and F5, plus boundary tests for outside buttons and existing keypad buttons.
- Updated issue #5 with the confirmed scope and diagnosis.

## Verification

Ran Node's built-in test runner against the branch source snapshot in an isolated scratch directory:

```text
25 tests passed
0 failed
```

No runtime dependencies were added.
