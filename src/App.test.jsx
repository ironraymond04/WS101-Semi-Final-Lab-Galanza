import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import App from './App.jsx'

beforeEach(() => {
  window.localStorage.clear()
})

afterEach(cleanup)

describe('expense capture controls', () => {
  it('requires an app currency before enabling expense entry', async () => {
    const user = userEvent.setup()
    render(<App />)

    expect(screen.getByLabelText('Amount')).toBeDisabled()
    await user.selectOptions(screen.getByLabelText('App currency'), 'USD')
    expect(screen.getByLabelText('Amount')).toBeEnabled()
    expect(screen.getByLabelText('Date').value).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('lets the user add a category and choose it for an expense', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.selectOptions(screen.getByLabelText('App currency'), 'USD')
    await user.click(screen.getByRole('button', { name: 'Manage categories' }))
    await user.type(screen.getByLabelText('New category'), 'Learning')
    await user.click(screen.getByRole('button', { name: 'Add', exact: true }))
    await user.click(screen.getByRole('button', { name: 'Done' }))
    const categorySelect = screen.getByLabelText('Category')
    await user.selectOptions(categorySelect, screen.getByRole('option', { name: 'Learning' }))

    expect(categorySelect).toHaveDisplayValue('Learning')
    expect(within(categorySelect).getByRole('option', { name: 'Learning' })).toBeInTheDocument()
  })

  it('saves an expense when merchant and note are omitted', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.selectOptions(screen.getByLabelText('App currency'), 'USD')
    await user.type(screen.getByLabelText('Amount'), '3.00')
    await user.click(screen.getByRole('button', { name: 'Add expense' }))

    const savedExpense = screen.getByRole('article')
    expect(savedExpense).toHaveTextContent('Food')
    expect(savedExpense).toHaveTextContent('$3.00')
  })
})