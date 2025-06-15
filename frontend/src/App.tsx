import { useEffect, useState, useMemo } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './components/ui/table'
import { Textarea } from './components/ui/textarea'
import { Button } from './components/ui/button'
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table'

interface DataItem {
  id: string
  name: string
  age: number
  gender: string
  email: string
  phone: string
  bio: string
  status: string
  createdAt: string
  updatedAt: string
  address: {
    street: string
    city: string
    state: string
    country: string
    zipCode: string
  }
  socialProfiles: {
    twitter: string
    github: string
    linkedin: string
  }
  tags: string[]
  metrics: {
    views: number
    likes: number
    shares: number
    comments: number
    rating: number
  }
  preferences: {
    theme: string
    notifications: {
      email: boolean
      push: boolean
      sms: boolean
    }
    privacy: {
      profileVisibility: string
      showEmail: boolean
      showPhone: boolean
    }
  }
  subscription: {
    plan: string
    startDate: string
    endDate: string
    autoRenew: boolean
  }
  lastLogin: {
    timestamp: string
    ip: string
    device: string
    browser: string
  }
}

// Helper function to format cell value
const formatCellValue = (value: string | number | boolean | null | undefined | object | unknown[]): string => {
  if (value === null || value === undefined) return '-'
  if (typeof value === 'object') {
    if (Array.isArray(value)) {
      return value.join(', ')
    }
    return JSON.stringify(value)
  }
  return String(value)
}

function App() {
  const [query, setQuery] = useState('')
  const [data, setData] = useState<DataItem[]>([])
  const [filteredData, setFilteredData] = useState<DataItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tableColumns, setTableColumns] = useState<string[]>([])

  const columnHelper = createColumnHelper<DataItem>()

  // Create columns dynamically
  const columns = useMemo(() => {
    if (tableColumns.length === 0) return []
    
    return tableColumns.map(column => 
      columnHelper.accessor(column as keyof DataItem, {
        header: () => column.replace(/([A-Z])/g, ' $1').trim(),
        cell: info => formatCellValue(info.getValue()),
      })
    )
  }, [tableColumns, columnHelper])

  // Initialize table
  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  })

  // Extract root level fields from the first data item
  useEffect(() => {
    if (filteredData.length > 0) {
      const firstItem = filteredData[0]
      const columns = Object.keys(firstItem).filter(key => 
        typeof firstItem[key as keyof DataItem] !== 'object' || 
        Array.isArray(firstItem[key as keyof DataItem])
      )
      setTableColumns(columns)
    }
  }, [filteredData])

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true)
        const response = await fetch('http://localhost:3000/api/filter', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: '',
            filePath: '/Users/mohsin/Developer/eappsys/json-query-builder/backend/data/large-dataset.json'
          })
        })

        if (!response.ok) {
          throw new Error('Failed to fetch data')
        }

        const result = await response.json()
        setData(result.data)
        setFilteredData(result.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    loadInitialData()
  }, [])

  // Handle query changes
  const handleQueryChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setQuery(e.target.value)
  }

  // Apply filter
  const applyFilter = async () => {
    try {
      setLoading(true)
      const response = await fetch('http://localhost:3000/api/filter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query.trim(),
          filePath: '/Users/mohsin/Developer/eappsys/json-query-builder/backend/data/large-dataset.json'
        })
      })

      if (!response.ok) {
        throw new Error('Failed to apply filter')
      }

      const result = await response.json()
      setFilteredData(result.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">JSON Query Builder</h1>
      <div className="space-y-4">
        <div>
          <h3 className="block mb-2">JSON Query</h3>
          <Textarea 
            className="w-full" 
            rows={10} 
            value={query}
            onChange={handleQueryChange}
            placeholder="Enter your query here..."
          />
          <div className="mt-2">
            <Button onClick={applyFilter} disabled={loading}>
              {loading ? 'Loading...' : 'Apply Filter'}
            </Button>
          </div>
        </div>

        {error && (
          <div className="text-red-500">
            Error: {error}
          </div>
        )}

        <div>
          <h3 className="block mb-2">Query Results ({filteredData.length} items)</h3>
          <div className="overflow-x-auto">
            <Table className="w-full">
              <TableHeader>
                {table.getHeaderGroups().map(headerGroup => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <TableHead key={header.id} className="capitalize">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.map(row => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map(cell => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                {'<<'}
              </Button>
              <Button
                variant="outline"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                {'<'}
              </Button>
              <Button
                variant="outline"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                {'>'}
              </Button>
              <Button
                variant="outline"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                {'>>'}
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1">
                <div>Page</div>
                <strong>
                  {table.getState().pagination.pageIndex + 1} of{' '}
                  {table.getPageCount()}
                </strong>
              </span>
              <select
                value={table.getState().pagination.pageSize}
                onChange={e => {
                  table.setPageSize(Number(e.target.value))
                }}
                className="border rounded p-1"
              >
                {[10, 20, 30, 40, 50].map(pageSize => (
                  <option key={pageSize} value={pageSize}>
                    Show {pageSize}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
