import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { useMemo } from 'react'

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue }

interface DataItem {
  [key: string]: JsonValue
}

// Helper function to format cell value
const formatCellValue = (value: JsonValue): string => {
  if (value === null || value === undefined) return '-'
  if (typeof value === 'object') {
    if (Array.isArray(value)) {
      return value.join(', ')
    }
    return JSON.stringify(value)
  }
  return String(value)
}

interface DataTableProps {
  data: DataItem[]
}

export function DataTable({ data }: DataTableProps) {
  const columnHelper = createColumnHelper<DataItem>()

  // Create columns dynamically
  const columns = useMemo(() => {
    if (data.length === 0) return []
    
    const firstItem = data[0]
    const tableColumns = Object.keys(firstItem).filter(key => 
      typeof firstItem[key] !== 'object' || 
      Array.isArray(firstItem[key])
    )
    
    return tableColumns.map(column => 
      columnHelper.accessor(column, {
        header: () => column.replace(/([A-Z])/g, ' $1').trim(),
        cell: info => formatCellValue(info.getValue()),
      })
    )
  }, [data, columnHelper])

  // Initialize table
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  })

  return (
    <div>
      <h3 className="block mb-2">Query Results ({data.length} items)</h3>
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
  )
} 