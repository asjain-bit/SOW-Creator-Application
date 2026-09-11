import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { DataTable } from './DataTable'

interface UserRecord {
  id: number
  name: string
  role: string
  [key: string]: unknown
}

const columns = [
  { key: 'id', header: 'ID', sortable: true },
  { key: 'name', header: 'Name', sortable: true },
  { key: 'role', header: 'Role' },
]

const sampleData: UserRecord[] = [
  { id: 1, name: 'Alice Smith', role: 'Admin' },
  { id: 2, name: 'Bob Jones', role: 'Developer' },
  { id: 3, name: 'Charlie Brown', role: 'Designer' },
]

describe('DataTable Component', () => {
  it('renders table headers and rows correctly', () => {
    render(<DataTable data={sampleData} columns={columns} pageSize={5} />)
    expect(screen.getByText('Alice Smith')).toBeInTheDocument()
    expect(screen.getByText('Bob Jones')).toBeInTheDocument()
    expect(screen.getByText('Charlie Brown')).toBeInTheDocument()
  })

  it('filters data when search input is used', async () => {
    render(<DataTable data={sampleData} columns={columns} pageSize={5} />)
    const searchInput = screen.getByPlaceholderText('Filter records...')
    await userEvent.type(searchInput, 'Alice')
    expect(screen.getByText('Alice Smith')).toBeInTheDocument()
    expect(screen.queryByText('Bob Jones')).not.toBeInTheDocument()
  })

  it('sorts columns ascending and descending when header is clicked', async () => {
    render(<DataTable data={sampleData} columns={columns} pageSize={5} />)
    const nameHeader = screen.getByText('Name')
    await userEvent.click(nameHeader)
    let rows = screen.getAllByRole('row')
    expect(rows[1]).toHaveTextContent('Alice Smith')

    // Click again for descending sort
    await userEvent.click(nameHeader)
    rows = screen.getAllByRole('row')
    expect(rows[1]).toHaveTextContent('Charlie Brown')

    // Click again to reset sort
    await userEvent.click(nameHeader)
  })

  it('handles pagination navigation and empty state', async () => {
    render(<DataTable data={sampleData} columns={columns} pageSize={2} />)
    expect(screen.getByText('Page 1 of 2')).toBeInTheDocument()

    const nextBtn = screen.getByRole('button', { name: /next page/i })
    await userEvent.click(nextBtn)
    expect(screen.getByText('Page 2 of 2')).toBeInTheDocument()

    const prevBtn = screen.getByRole('button', { name: /previous page/i })
    await userEvent.click(prevBtn)
    expect(screen.getByText('Page 1 of 2')).toBeInTheDocument()
  })

  it('renders empty table state when no data matches search', async () => {
    render(<DataTable data={[]} columns={columns} pageSize={5} />)
    expect(screen.getByText('No matching data found.')).toBeInTheDocument()
  })
})
