import { useState, useEffect } from 'react'
import { QueryInput } from '@/components/query-builder/QueryInput'
import { DataTable } from '@/components/query-builder/DataTable'
import { API_BASE_URL } from '@/config'

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue }

interface DataItem {
  [key: string]: JsonValue
}

export default function App() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<DataItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filterTime, setFilterTime] = useState<number | null>(null)
  const filePath = '/Users/mohsin/Developer/eappsys/json-query-builder/backend/data/large-dataset.json'

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true)
        const startTime = performance.now()
        
        const response = await fetch(`${API_BASE_URL}/api/filter`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: '',
            filePath
          })
        })

        const result = await response.json()
        if (!result.success) {
          throw new Error(result.error || 'Failed to load data')
        }

        const endTime = performance.now()
        setFilterTime(endTime - startTime)
        setResults(result.data)
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
  const handleApplyFilter = async () => {
    try {
      setLoading(true)
      const startTime = performance.now()
      
      const response = await fetch(`${API_BASE_URL}/api/filter`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query.trim(),
          filePath
        })
      })

      const result = await response.json()
      if (!result.success) {
        throw new Error(result.error || 'Failed to filter data')
      }

      const endTime = performance.now()
      setFilterTime(endTime - startTime)
      setResults(result.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">JSON Query Builder</h1>
      <div className="grid grid-cols-1 gap-4">
        <div>
          <QueryInput
            query={query}
            loading={loading}
            filterTime={filterTime}
            onQueryChange={handleQueryChange}
            onApplyFilter={handleApplyFilter}
            filePath={filePath}
          />
        </div>
        <div>
          {error && (
            <div className="text-red-500">
              Error: {error}
            </div>
          )}
          <DataTable data={results} />
        </div>
      </div>
    </div>
  )
}
