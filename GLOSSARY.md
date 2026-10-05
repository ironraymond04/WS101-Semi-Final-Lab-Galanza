# Personal Expense Tracking

The personal expense-tracking context records one user's spending and organizes it for review in expense history and summaries.

## Language

**Expense**:
A positive outflow of money recorded on a date in the app currency and assigned to one category. Merchant and note are optional details.
_Avoid_: Transaction, purchase

**App currency**:
The single currency used for every expense amount in this app. It is selected before the first expense is recorded and cannot be changed while expense data exists.
_Avoid_: Base currency

**Category**:
A flat, user-editable classification assigned to one expense. Renaming a category changes its displayed name on historical expenses; an archived category remains visible on those expenses but cannot be assigned to new ones.
_Avoid_: Tag