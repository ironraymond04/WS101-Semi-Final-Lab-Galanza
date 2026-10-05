# Expense Management MVP

Status: ready-for-agent

## Problem Statement

A person needs a simple way to record personal expenses and review their expense history and spending summaries. The requested system is an MVP for one user, not a full personal-finance or household-management product. The repository does not yet contain an application or an established technology stack.

## Solution

Build a responsive web app that lets one person manually record expenses, browse their history, and review summaries. Expense data must remain available in the same browser/device. The app covers expenses only; budgets, receipts, shared access, and financial-account integrations are outside this MVP.

Each expense is a positive outflow in one app-wide currency, dated locally, and assigned to one category. The user selects the currency before recording the first expense; it cannot be changed while saved expense data exists. Amount, date, and category are required; merchant and note are optional. The date defaults to today in the user's local time and can be changed. Expenses cannot be split across categories. Categories are a flat editable list with built-in defaults; renaming changes historical display, and removing a used category archives it so historical expenses retain it but new expenses cannot use it.

Summary periods and breakdowns, the web stack, correction/validation behavior, and local-data recovery controls remain open decisions. Resolve them through the linked wayfinder tickets before treating this spec as a detailed implementation contract.

## User Stories

1. As a person tracking my spending, I want to record an expense manually, so that I can maintain my own expense history.
2. As a user, I want to enter the expense information selected for the MVP, so that each record is useful without requiring fields the product has not chosen to collect.
3. As a user, I want expenses organized using the agreed category model, so that I can understand what my spending relates to.
4. As a user, I want the app to preserve my expenses in the same browser/device, so that my history is still available when I return.
5. As a user, I want to browse my recorded expenses, so that I can review past spending.
6. As a user, I want expense summaries over the agreed time periods, so that I can understand spending at a glance.
7. As a user, I want summaries to use the agreed totals and breakdowns, so that the numbers have a clear and consistent meaning.
8. As a user, I want saved expenses to be reflected in my history and summaries, so that those views represent the records I entered.
9. As a user, I want to correct an inaccurate expense according to the product's correction rules, so that my records remain trustworthy.
10. As a user, I want invalid expense input handled according to clear validation rules, so that incorrect data does not silently enter my history.
11. As a user, I want the core expense workflow to work in a responsive browser layout, so that I can use it on desktop or phone-sized screens.
12. As a single user, I want the MVP to focus on expenses rather than income, balances, or transfers, so that the product stays centered on the requested job.
13. As a user, I want to enter expenses without connecting a bank or importing a statement, so that manual tracking is sufficient for this release.
14. As a user, I want to use the core history and summary experience without budgets, receipt storage, or shared-household access, so that those capabilities do not delay the MVP.

Stories 6-10 intentionally leave summary and correction details to the remaining wayfinder decisions; they describe user intent without pre-deciding those details.

## Implementation Decisions

- The product is a responsive web MVP for one person.
- The domain scope is outgoing expenses only, entered manually.
- Each expense has a positive amount, date, and one category; merchant and note are optional. Refunds, negative expenses, and category splits are excluded.
- All expenses use one user-selected app currency, which is locked while saved expense data exists. Amount precision follows the selected currency's supported precision.
- Expense dates default to the current local date and are editable.
- Categories are a flat editable list seeded with Food, Transport, Housing, Utilities, Health, Shopping, Entertainment, and Other. Renames update historical display; removing a used category archives it and prevents new assignments.
- The app uses React + Vite with JavaScript and npm. It runs locally with Vite and produces a static build; no hosting provider is selected.
- Expense data persists in localStorage in the same browser/device.
- Use Vitest and Testing Library for unit/component tests and Playwright for browser acceptance tests at the agreed user-visible seam.
- The core outcomes are expense history and expense summaries.
- Data schema, module boundaries, and interfaces remain open rather than being inferred from this empty repository.

## Testing Decisions

- Prefer tests at the highest user-visible seam: enter an expense through the app, find it in history, verify it affects the agreed summary, reload, and verify it remains available in the same browser/device.
- A good test asserts externally observable behavior and outcomes, not internal component structure, storage implementation, or helper call sequences.
- Extend the same acceptance seam with the agreed validation and correction cases after those rules are decided.
- The modules under test cannot be named until module boundaries are chosen. The primary tested surface is the browser-facing expense workflow and its persistence behavior, using the selected Vitest, Testing Library, and Playwright tools.
- There is no existing application code or test suite to use as prior art.

## Out of Scope

- Income, account balances, transfers, or full personal-finance management.
- Bank connections, transaction synchronization, or statement-file import.
- Budgets, receipt storage, or shared-household access.
- Cross-device synchronization or cloud availability beyond the same browser/device.
- Recording refunds or negative expense amounts.

## Further Notes

- The map is [Expense Management MVP Map](map.md).
- Resolved decisions: [Expense record and category model](issues/01-expense-record-and-category-model.md) and [Web stack and run target](issues/03-web-stack-and-run-target.md). Open decisions: [Expense summary definitions](issues/02-expense-summary-definitions.md), [Expense correction and validation](issues/04-expense-correction-and-validation.md), and [Local data recovery and portability](issues/05-local-data-recovery-and-portability.md).
- Refine this spec as those decisions are resolved. It records the agreed product boundary, not the unresolved details of the implementation.