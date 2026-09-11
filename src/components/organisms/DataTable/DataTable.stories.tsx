import type { Meta, StoryObj } from '@storybook/react'
import { Badge } from '@/components/atoms/Badge'
import { DataTable } from './DataTable'
import { Column } from './DataTable.types'

interface ProjectRow {
  name: string
  status: string
  owner: string
  [key: string]: unknown
}

const meta: Meta<typeof DataTable> = {
  title: 'Organisms/DataTable',
  component: DataTable,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof DataTable>

const columns: Column<ProjectRow>[] = [
  { key: 'name', header: 'Project', sortable: true },
  {
    key: 'status',
    header: 'Status',
    render: (row: ProjectRow) => (
      <Badge variant={row.status === 'Active' ? 'success' : 'warning'}>{row.status}</Badge>
    ),
  },
  { key: 'owner', header: 'Owner', sortable: true },
]

const data: ProjectRow[] = [
  { name: 'Core API v2', status: 'Active', owner: 'Alice' },
  { name: 'Frontend Scaffold', status: 'Active', owner: 'Bob' },
  { name: 'Legacy Migration', status: 'Pending', owner: 'Charlie' },
]

export const Default: Story = {
  render: () => <DataTable<ProjectRow> data={data} columns={columns} pageSize={2} />,
}

export const EdgeCases: Story = {
  render: () => <DataTable<ProjectRow> data={[]} columns={columns} searchable />,
}
