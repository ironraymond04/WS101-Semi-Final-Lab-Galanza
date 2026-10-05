import { expect, test } from '@playwright/test'

test('records an expense, shows it in history, and retains it after reload', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { name: 'Expenses' })).toBeVisible()
  await page.getByLabel('App currency').selectOption('USD')
  await page.getByLabel('App currency').selectOption('EUR')
  await page.getByLabel('App currency').selectOption('USD')
  const localDateToday = await page.evaluate(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  })
  await expect(page.getByLabel('Date')).toHaveValue(localDateToday)
  await page.getByLabel('Amount').fill('12.50')
  await page.getByLabel('Category').selectOption({ label: 'Food' })
  await page.getByLabel('Merchant').fill('Corner Market')
  await page.getByLabel('Note').fill('Lunch')
  await page.getByRole('button', { name: 'Add expense' }).click()

  const savedExpense = page.getByRole('article').filter({ hasText: 'Corner Market' })
  await expect(savedExpense).toContainText('Food')
  await expect(savedExpense).toContainText('$12.50')
  await expect(page.getByLabel('App currency')).toBeDisabled()

  await page.reload()

  const persistedExpense = page.getByRole('article').filter({ hasText: 'Corner Market' })
  await expect(persistedExpense).toContainText('Lunch')
  await expect(persistedExpense).toContainText('$12.50')
})

test('category rename and archive preserve the category shown on an existing expense', async ({ page }) => {
  await page.goto('/')
  await page.getByLabel('App currency').selectOption('USD')
  await page.getByRole('button', { name: 'Manage categories' }).click()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).not.toBeVisible()

  await page.getByRole('button', { name: 'Manage categories' }).click()
  await page.getByLabel('New category').fill('Learning')
  await page.getByRole('button', { name: 'Add', exact: true }).click()
  await page.getByRole('button', { name: 'Done' }).click()

  await page.getByLabel('Amount').fill('45.00')
  await page.getByLabel('Category').selectOption({ label: 'Learning' })
  await page.getByLabel('Merchant').fill('Evening class')
  await page.getByRole('button', { name: 'Add expense' }).click()

  const expense = page.getByRole('article').filter({ hasText: 'Evening class' })
  await expect(expense).toContainText('Learning')

  await page.getByLabel('Category').selectOption({ label: 'Learning' })
  await page.getByRole('button', { name: 'Manage categories' }).click()
  await page.getByRole('button', { name: 'Rename Learning' }).click()
  await page.getByLabel('Rename Learning').fill('Education')
  await page.getByRole('button', { name: 'Save Learning' }).click()
  await page.getByRole('button', { name: 'Archive Education' }).click()
  await page.getByRole('button', { name: 'Done' }).click()

  await expect(page.getByLabel('Category')).toHaveValue('food')
  await expect(page.getByLabel('Category').getByRole('option', { name: 'Education' })).toHaveCount(0)
  await expect(expense).toContainText('Education')
  await page.reload()
  await expect(page.getByRole('article').filter({ hasText: 'Evening class' })).toContainText('Education')
})

test('expense entry and history fit a phone-sized viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')

  await expect(page.getByRole('heading', { name: 'Expenses' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Expense history' })).toBeVisible()
  const capturePanel = await page.getByRole('region', { name: 'New expense' }).boundingBox()
  const historyPanel = await page.getByRole('region', { name: 'Expense history' }).boundingBox()
  const documentWidth = await page.locator('body').evaluate((body) => body.scrollWidth)

  expect(capturePanel).not.toBeNull()
  expect(historyPanel).not.toBeNull()
  expect(capturePanel.y).toBeLessThan(historyPanel.y)
  expect(documentWidth).toBeLessThanOrEqual(390)
})

test('expense entry and history share a row on a desktop viewport', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')

  await expect(page.getByRole('heading', { name: 'Expenses' })).toBeVisible()
  const capturePanel = await page.getByRole('region', { name: 'New expense' }).boundingBox()
  const historyPanel = await page.getByRole('region', { name: 'Expense history' }).boundingBox()
  const documentWidth = await page.locator('body').evaluate((body) => body.scrollWidth)

  expect(capturePanel).not.toBeNull()
  expect(historyPanel).not.toBeNull()
  expect(capturePanel.x).toBeLessThan(historyPanel.x)
  expect(Math.abs(capturePanel.y - historyPanel.y)).toBeLessThan(24)
  expect(documentWidth).toBeLessThanOrEqual(1440)
})