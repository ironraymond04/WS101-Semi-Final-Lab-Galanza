# Expense Management MVP Map

## Destination

A working, responsive web MVP in this repository for one person to manually record expenses and review their expense history and summaries. It tracks expenses only, and data is available in the same browser/device. The map is complete when the product and technical decisions needed to build that MVP are resolved.

## Notes

- Domain: personal expense tracking for a single user.
- Constraints: manual expense entry, responsive web app, same-browser/device data, expense history and summaries.
- Stack: React + Vite with JavaScript and npm; localStorage persistence; Vitest + Testing Library and Playwright; local Vite run and static build, with no hosting target selected.
- Tracker: local markdown under `.scratch/`; see `docs/agents/issue-tracker.md`.
- Consult `domain-modeling` when resolving terminology or domain boundaries.

## Decisions so far

<!-- One line per closed ticket. The ticket holds the decision detail. -->

- [Expense record and category model](issues/01-expense-record-and-category-model.md): Expenses are positive single-currency outflows, dated locally, and assigned to one category from an editable flat list; merchant and note are optional.
- [Web stack and run target](issues/03-web-stack-and-run-target.md): The app uses React + Vite, JavaScript, npm, localStorage, Vitest + Testing Library, and Playwright; it runs locally and builds statically without a selected host.

## Not yet specified

- Once the record and summary decisions are settled, specify the exact create, browse, and correction interactions; decide whether a prototype is needed.
- Revisit edge cases surfaced by those decisions before implementation, rather than pre-splitting them now.

## Out of scope

- Income, account balances, transfers, or full personal-finance management; this MVP tracks expenses only.
- Bank connections, transaction sync, and statement-file import; capture is manual.
- Budgets, receipt storage, and shared-household access; none were selected as MVP outcomes.