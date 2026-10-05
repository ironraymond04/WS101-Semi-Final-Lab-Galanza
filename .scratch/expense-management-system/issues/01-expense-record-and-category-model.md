# Expense record and category model

Type: grilling
Status: resolved

## Question

What information defines one expense, and how should its category work? Decide the required and optional fields (including amount, currency, date, merchant, and note), whether an expense can be split across categories, and whether categories are fixed, user-editable, or hierarchical. Include how category changes affect existing expenses.

## Answer

- An expense is a positive outflow only; refunds and negative expense records are outside this MVP. Amount precision follows the selected currency's supported precision.
- The app uses one currency for all expenses. The user explicitly selects it before recording the first expense; it cannot be changed while saved expense data exists.
- Each expense requires an amount, date, and one category. Merchant and note are optional. An expense cannot be split across categories.
- The date defaults to the current local date and can be changed by the user.
- Categories are a flat editable list, initially containing Food, Transport, Housing, Utilities, Health, Shopping, Entertainment, and Other. Users can add, rename, and remove categories.
- Renaming a category updates its displayed name on historical expenses. Removing a category that has expenses archives it: those expenses continue to display it, and new expenses cannot be assigned to it.