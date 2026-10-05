import { useEffect, useRef, useState } from 'react'
import {
  Archive,
  ArrowDownLeft,
  CalendarDays,
  Check,
  CircleDollarSign,
  Plus,
  Settings2,
  X,
} from 'lucide-react'

const STORAGE_KEY = 'pocket-ledger:v1'
const DEFAULT_CATEGORIES = [
  'Food',
  'Transport',
  'Housing',
  'Utilities',
  'Health',
  'Shopping',
  'Entertainment',
  'Other',
].map((name) => ({ id: name.toLowerCase(), name, archived: false }))
const CURRENCY_CODES =
  typeof Intl.supportedValuesOf === 'function'
    ? Intl.supportedValuesOf('currency')
    : ['AUD', 'CAD', 'CNY', 'EUR', 'GBP', 'INR', 'JPY', 'PHP', 'SGD', 'USD']

function localDateToday() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function readLedger() {
  try {
    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY))
    if (!stored || !Array.isArray(stored.categories) || !Array.isArray(stored.expenses)) {
      return null
    }

    return stored
  } catch {
    return null
  }
}

function currencyFractionDigits(currency) {
  if (!currency) return 2

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).resolvedOptions().maximumFractionDigits
}

function formatAmount(amountMinor, currency) {
  const fractionDigits = currencyFractionDigits(currency)
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(amountMinor / 10 ** fractionDigits)
}

function formatExpenseDate(value) {
  const [year, month, day] = value.split('-').map(Number)
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(year, month - 1, day))
}

function createId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`
}

export default function App() {
  const [ledger, setLedger] = useState(
    () => readLedger() ?? { currency: '', categories: DEFAULT_CATEGORIES, expenses: [] },
  )
  const { currency, categories, expenses } = ledger
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(localDateToday)
  const [categoryId, setCategoryId] = useState(
    () => ledger.categories.find((category) => !category.archived)?.id ?? 'food',
  )
  const [merchant, setMerchant] = useState('')
  const [note, setNote] = useState('')
  const [formError, setFormError] = useState('')
  const [storageError, setStorageError] = useState('')
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [categoryError, setCategoryError] = useState('')
  const [editingCategoryId, setEditingCategoryId] = useState('')
  const [editingCategoryName, setEditingCategoryName] = useState('')
  const categoryDialogRef = useRef(null)

  useEffect(() => {
    const dialog = categoryDialogRef.current
    if (!dialog || !categoryDialogOpen || dialog.open) return

    if (typeof dialog.showModal === 'function') dialog.showModal()
    else dialog.setAttribute('open', '')
  }, [categoryDialogOpen])

  const fractionDigits = currencyFractionDigits(currency)
  const amountStep = 1 / 10 ** fractionDigits
  const activeCategories = categories.filter((category) => !category.archived)
  const usedCategoryIds = new Set(expenses.map((expense) => expense.categoryId))
  const sortedExpenses = expenses.slice().sort((left, right) => {
    const byDate = right.date.localeCompare(left.date)
    return byDate || right.createdAt - left.createdAt
  })
  const currencyNames = new Intl.DisplayNames(['en'], { type: 'currency' })
  const hasExpenses = expenses.length > 0

  function persist(next) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      setLedger(next)
      setStorageError('')
      return true
    } catch {
      setStorageError('This browser could not save your changes. Check its storage settings and try again.')
      return false
    }
  }

  function handleCurrencyChange(event) {
    const nextCurrency = event.target.value
    persist({ ...ledger, currency: nextCurrency })
  }

  function handleSubmit(event) {
    event.preventDefault()
    setFormError('')

    const parsedAmount = Number(amount)
    if (!currency || !Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setFormError('Enter an amount greater than zero.')
      return
    }

    const decimalPart = amount.split('.')[1] ?? ''
    if (decimalPart.length > fractionDigits) {
      setFormError(`This currency supports up to ${fractionDigits} decimal places.`)
      return
    }

    if (!date || !activeCategories.some((category) => category.id === categoryId)) {
      setFormError('Choose a date and an active category.')
      return
    }

    const amountMinor = Math.round(parsedAmount * 10 ** fractionDigits)
    const expense = {
      id: createId(),
      amountMinor,
      date,
      categoryId,
      merchant: merchant.trim(),
      note: note.trim(),
      createdAt: Date.now(),
    }

    if (persist({ ...ledger, expenses: [...expenses, expense] })) {
      setAmount('')
      setDate(localDateToday())
      setCategoryId(activeCategories[0]?.id ?? '')
      setMerchant('')
      setNote('')
    }
  }

  function saveCategoryName(id, rawName) {
    const name = rawName.trim()
    if (!name) {
      setCategoryError('Category names cannot be empty.')
      return false
    }

    const duplicate = categories.some(
      (category) => category.id !== id && category.name.toLocaleLowerCase() === name.toLocaleLowerCase(),
    )
    if (duplicate) {
      setCategoryError('A category with that name already exists.')
      return false
    }

    const nextCategories = id
      ? categories.map((category) => (category.id === id ? { ...category, name } : category))
      : [...categories, { id: createId(), name, archived: false }]

    if (persist({ ...ledger, categories: nextCategories })) {
      setCategoryError('')
      return true
    }

    return false
  }

  function handleAddCategory(event) {
    event.preventDefault()
    if (saveCategoryName('', newCategoryName)) setNewCategoryName('')
  }

  function handleRenameCategory(event, id) {
    event.preventDefault()
    if (saveCategoryName(id, editingCategoryName)) {
      setEditingCategoryId('')
      setEditingCategoryName('')
    }
  }

  function handleRemoveCategory(category) {
    const isUsed = usedCategoryIds.has(category.id)
    const nextCategories = isUsed
      ? categories.map((item) => (item.id === category.id ? { ...item, archived: true } : item))
      : categories.filter((item) => item.id !== category.id)

    persist({ ...ledger, categories: nextCategories })
    if (categoryId === category.id) {
      setCategoryId(activeCategories.find((item) => item.id !== category.id)?.id ?? '')
    }
  }

  function closeCategoryDialog() {
    const dialog = categoryDialogRef.current
    if (dialog?.open && typeof dialog.close === 'function') dialog.close()
    else setCategoryDialogOpen(false)
  }

  const categoriesById = new Map(categories.map((category) => [category.id, category]))

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#expenses" aria-label="Pocket Ledger home">
          <span className="brand-mark"><CircleDollarSign size={22} strokeWidth={1.8} /></span>
          <span className="brand-copy">
            <strong>Pocket Ledger</strong>
            <small>PERSONAL FINANCE</small>
          </span>
        </a>

        <div className="sidebar-label">YOUR SPACE</div>
        <nav aria-label="Main navigation">
          <a className="nav-link is-active" href="#expenses" aria-current="page">
            <ArrowDownLeft size={18} />
            <span>Expenses</span>
            <span className="nav-count">{expenses.length}</span>
          </a>
        </nav>

        <div className="sidebar-bottom">
          <span className="local-indicator" aria-hidden="true" />
          <span>
            <strong>Stored on this device</strong>
            <small>Your ledger stays in this browser</small>
          </span>
        </div>
      </aside>

      <div className="workspace" id="expenses">
        <header className="topbar">
          <div className="breadcrumb"><span>PERSONAL</span><span className="breadcrumb-divider">/</span> MY LEDGER</div>
          <div className="topbar-status"><span className="status-dot" /> LOCAL STORAGE</div>
        </header>

        <main className="page-content">
          <section className="page-heading">
            <div>
              <div className="eyebrow">YOUR MONEY, IN VIEW</div>
              <h1>Expenses</h1>
              <p className="page-description">A clear record of what you spend, one entry at a time.</p>
            </div>
            <div className="currency-setting">
              <label htmlFor="app-currency">APP CURRENCY</label>
              <select
                id="app-currency"
                aria-label="App currency"
                value={currency}
                onChange={handleCurrencyChange}
                disabled={hasExpenses}
              >
                <option value="">Choose currency</option>
                {CURRENCY_CODES.map((code) => (
                  <option key={code} value={code}>
                    {currencyNames.of(code) ?? code} ({code})
                  </option>
                ))}
              </select>
              {hasExpenses && <span className="setting-hint">Locked while expenses are saved</span>}
            </div>
          </section>

          {storageError && <div className="notice notice-error" role="alert">{storageError}</div>}

          <div className="ledger-grid">
            <section className="capture-panel" aria-labelledby="capture-title">
              <div className="panel-heading">
                <div className="panel-icon"><Plus size={17} /></div>
                <div>
                  <h2 id="capture-title">New expense</h2>
                  <p>Capture the details while they are fresh.</p>
                </div>
              </div>

              {!currency && (
                <div className="currency-prompt">
                  <span className="prompt-rule" />
                  <p>Choose an app currency above to start your ledger.</p>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <fieldset disabled={!currency}>
                  <legend className="visually-hidden">Expense details</legend>
                  <label className="field-label" htmlFor="expense-amount">Amount</label>
                  <div className="amount-field">
                    <span className="amount-symbol" aria-hidden="true">
                      {currency ? new Intl.NumberFormat('en-US', { style: 'currency', currency }).formatToParts(0).find((part) => part.type === 'currency')?.value : '$'}
                    </span>
                    <input
                      id="expense-amount"
                      aria-label="Amount"
                      type="number"
                      min={amountStep}
                      step={amountStep}
                      inputMode="decimal"
                      placeholder={fractionDigits === 0 ? '0' : '0.00'}
                      value={amount}
                      onChange={(event) => setAmount(event.target.value)}
                      required
                    />
                    <span className="amount-currency">{currency || '---'}</span>
                  </div>

                  <div className="field-row">
                    <div className="field-group">
                      <label className="field-label" htmlFor="expense-date">Date</label>
                      <div className="input-with-icon">
                        <CalendarDays size={16} aria-hidden="true" />
                        <input
                          id="expense-date"
                          aria-label="Date"
                          type="date"
                          value={date}
                          onChange={(event) => setDate(event.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="field-group">
                      <label className="field-label" htmlFor="expense-category">Category</label>
                      <select
                        id="expense-category"
                        aria-label="Category"
                        value={categoryId}
                        onChange={(event) => setCategoryId(event.target.value)}
                        required
                      >
                        <option value="" disabled>Select one</option>
                        {activeCategories.map((category) => (
                          <option key={category.id} value={category.id}>{category.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <label className="field-label" htmlFor="expense-merchant">Merchant <span>OPTIONAL</span></label>
                  <input
                    id="expense-merchant"
                    aria-label="Merchant"
                    type="text"
                    placeholder="Where did you spend?"
                    value={merchant}
                    onChange={(event) => setMerchant(event.target.value)}
                  />

                  <label className="field-label" htmlFor="expense-note">Note <span>OPTIONAL</span></label>
                  <textarea
                    id="expense-note"
                    aria-label="Note"
                    rows="2"
                    placeholder="Add a little context"
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                  />

                  {formError && <div className="field-error" role="alert">{formError}</div>}

                  <div className="form-actions">
                    <button className="button button-primary" type="submit">
                      <Plus size={17} /> Add expense
                    </button>
                    <button
                      className="button button-quiet"
                      type="button"
                      onClick={() => {
                        setCategoryError('')
                        setCategoryDialogOpen(true)
                      }}
                      aria-label="Manage categories"
                      title="Manage categories"
                    >
                      <Settings2 size={17} />
                      <span>Categories</span>
                    </button>
                  </div>
                </fieldset>
              </form>
            </section>

            <section className="history-panel" aria-labelledby="history-title">
              <div className="history-heading">
                <div>
                  <div className="eyebrow">YOUR RECORD</div>
                  <h2 id="history-title">Expense history</h2>
                </div>
                <span className="entry-count">{expenses.length} {expenses.length === 1 ? 'ENTRY' : 'ENTRIES'}</span>
              </div>

              {sortedExpenses.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-mark"><ArrowDownLeft size={22} /></div>
                  <h3>Your ledger starts here</h3>
                  <p>Once you add an expense, it will appear here with its category and date.</p>
                </div>
              ) : (
                <div className="expense-list" aria-label="Saved expenses">
                  {sortedExpenses.map((expense) => {
                    const category = categoriesById.get(expense.categoryId)
                    return (
                      <article className="expense-entry" key={expense.id}>
                        <div className="entry-category-mark" aria-hidden="true">{(category?.name ?? 'E').slice(0, 1).toUpperCase()}</div>
                        <div className="entry-main">
                          <div className="entry-title">{expense.merchant || category?.name || 'Expense'}</div>
                          <div className="entry-meta">
                            <span>{category?.name ?? 'Archived category'}</span>
                            <span className="meta-dot">·</span>
                            <time dateTime={expense.date}>{formatExpenseDate(expense.date)}</time>
                          </div>
                          {expense.note && <p className="entry-note">{expense.note}</p>}
                        </div>
                        <div className="entry-amount">{formatAmount(expense.amountMinor, currency)}</div>
                      </article>
                    )
                  })}
                </div>
              )}
            </section>
          </div>

          <footer className="page-footer">
            <span><span className="footer-dot" /> Saved locally on this device</span>
            <span>No account · No bank connection</span>
          </footer>
        </main>
      </div>

      {categoryDialogOpen && (
        <dialog
          ref={categoryDialogRef}
          className="category-dialog"
          aria-labelledby="category-dialog-title"
          onClose={() => setCategoryDialogOpen(false)}
          onClick={(event) => {
            if (event.target === event.currentTarget) closeCategoryDialog()
          }}
        >
            <div className="dialog-heading">
              <div>
                <div className="eyebrow">KEEP YOUR LIST USEFUL</div>
                <h2 id="category-dialog-title">Manage categories</h2>
              </div>
              <button className="icon-button" type="button" aria-label="Close categories" onClick={closeCategoryDialog}>
                <X size={19} />
              </button>
            </div>

            {categoryError && <div className="field-error" role="alert">{categoryError}</div>}

            <form className="new-category-form" onSubmit={handleAddCategory}>
              <label className="visually-hidden" htmlFor="new-category">New category</label>
              <input
                id="new-category"
                aria-label="New category"
                type="text"
                placeholder="Name a category"
                value={newCategoryName}
                onChange={(event) => setNewCategoryName(event.target.value)}
                required
              />
              <button className="button button-primary" type="submit"><Plus size={16} /> Add</button>
            </form>

            <ul className="category-list">
              {categories.map((category) => {
                const isUsed = usedCategoryIds.has(category.id)
                const isEditing = editingCategoryId === category.id
                return (
                  <li className={category.archived ? 'category-row is-archived' : 'category-row'} key={category.id}>
                    {isEditing ? (
                      <form className="rename-form" onSubmit={(event) => handleRenameCategory(event, category.id)}>
                        <label className="visually-hidden" htmlFor={`rename-${category.id}`}>Rename {category.name}</label>
                        <input
                          id={`rename-${category.id}`}
                          value={editingCategoryName}
                          onChange={(event) => setEditingCategoryName(event.target.value)}
                          autoFocus
                        />
                        <button className="icon-button" type="submit" aria-label={`Save ${category.name}`}><Check size={17} /></button>
                      </form>
                    ) : (
                      <>
                        <span className="category-name">{category.name}</span>
                        {category.archived && <span className="archived-label">ARCHIVED</span>}
                        {!category.archived && (
                          <button
                            className="icon-button category-action"
                            type="button"
                            aria-label={`Rename ${category.name}`}
                            title={`Rename ${category.name}`}
                            onClick={() => {
                              setCategoryError('')
                              setEditingCategoryId(category.id)
                              setEditingCategoryName(category.name)
                            }}
                          >
                            <span className="edit-glyph" aria-hidden="true">Aa</span>
                          </button>
                        )}
                        {!category.archived && (
                          <button
                            className="icon-button category-action archive-action"
                            type="button"
                            aria-label={`${isUsed ? 'Archive' : 'Remove'} ${category.name}`}
                            title={isUsed ? 'Archive category' : 'Remove category'}
                            onClick={() => handleRemoveCategory(category)}
                          >
                            <Archive size={16} />
                          </button>
                        )}
                      </>
                    )}
                  </li>
                )
              })}
            </ul>

            <div className="dialog-footnote">Used categories are archived so past expenses keep their history.</div>
            <button className="button button-quiet dialog-done" type="button" onClick={closeCategoryDialog}>Done</button>
        </dialog>
      )}
    </div>
  )
}