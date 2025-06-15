import { useState, useEffect } from 'react'
import { QueryInput } from './components/query-builder/QueryInput'
import { DataTable } from './components/query-builder/DataTable'
import { Button } from './components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Search, Clock } from 'lucide-react'
import { API_BASE_URL } from '@/config'

const JQL_SYNTAX_EXAMPLES = [
  'project = "PROJECT-A" - Exact match',
  'summary ~ "bug" - Contains text',
  'status in (Open, "In Progress") - Multiple values',
  'priority = High AND assignee = currentUser() - AND condition',
  '(status = Open OR status = "In Progress") AND priority = High - Grouping',
]

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };
type DataItem = { [key: string]: JsonValue };

export default function App() {
  const [query, setQuery] = useState('')
  const [data, setData] = useState<DataItem[]>([])
  const [initialData, setInitialData] = useState<DataItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filterTime, setFilterTime] = useState<number | null>(null)
  const [tab, setTab] = useState<'jql' | 'visual'>('jql')
  const filePath = '/Users/mohsin/Developer/eappsys/json-query-builder/backend/data/large-dataset.json'
  const [filterApplied, setFilterApplied] = useState(false)

  const onApplyFilter = async () => {
    setLoading(true)
    setError(null)
    setFilterApplied(true)
    const start = performance.now()
    try {
      const response = await fetch(`${API_BASE_URL}/api/filter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim(), filePath })
      })
      const result = await response.json()
      if (!result.success) {
        throw new Error(result.error || 'Failed to filter data')
      }
      setData(result.data)
      setFilterTime(performance.now() - start)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to filter data')
    } finally {
      setLoading(false)
    }
  }

  // Load initial data on mount
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(`${API_BASE_URL}/api/filter`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: '', filePath })
        })
        const result = await response.json()
        if (!result.success) {
          throw new Error(result.error || 'Failed to load initial data')
        }
        setInitialData(result.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load initial data')
      } finally {
        setLoading(false)
      }
    }
    fetchInitialData()
  }, [])

  return (
    <div className="min-h-screen bg-[#f7f8fa]">
      {/* Header */}
      <header className="container mx-auto flex items-center justify-between py-6">
        <div className="flex items-center gap-3">
          <Search className="w-6 h-6 text-gray-700" />
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">JQL Search</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <span>Save Filter</span>
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>History</span>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto space-y-8">
        {/* Filter Builder */}
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span>&lt;&gt;</span> Filter Builder
          </h2>
          <Tabs value={tab} onValueChange={(v: string) => setTab(v as 'jql' | 'visual')}>
            <TabsList className="mb-4">
              <TabsTrigger value="visual">Visual</TabsTrigger>
              <TabsTrigger value="jql">JQL</TabsTrigger>
            </TabsList>
            <TabsContent value="jql">
              <div className="mb-4">
                <QueryInput
                  query={query}
                  loading={loading}
                  filterTime={filterTime}
                  onQueryChange={e => setQuery(e.target.value)}
                  onApplyFilter={onApplyFilter}
                  filePath={filePath}
                />
              </div>
              <div className="bg-blue-50 rounded p-4 text-sm text-gray-700">
                <div className="font-semibold mb-2">JQL Syntax Examples:</div>
                <ul className="list-disc pl-5 space-y-1">
                  {JQL_SYNTAX_EXAMPLES.map((ex) => (
                    <li key={ex}>{ex}</li>
                  ))}
                </ul>
              </div>
            </TabsContent>
            <TabsContent value="visual">
              <div className="flex flex-col items-center justify-center min-h-[180px]">
                <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="#cbd5e1" strokeWidth="1.5" aria-label="No filters applied icon"><title>No filters applied</title><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" /></svg>
                <div className="text-gray-500 mt-2 mb-1 text-lg">No filters applied</div>
                <div className="text-gray-400 mb-4">Start building your search query</div>
                <Button variant="default">+ Add First Condition</Button>
              </div>
            </TabsContent>
          </Tabs>
        </section>

        {/* Search Results */}
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Search Results</h2>
          {/* Show error or results */}
          {error && <div className="text-red-500 mb-2">{error}</div>}
          {filterApplied ? (
            data.length > 0 ? (
              <DataTable data={data} />
            ) : (
              <div className="text-gray-400 text-center py-8">
                No results found for your query.
              </div>
            )
          ) : initialData.length > 0 ? (
            <DataTable data={initialData} />
          ) : (
            <div className="text-gray-400 text-center py-8">
              Results would appear here based on your JQL query<br />
              <span className="text-xs">Connect to your data source to see actual results</span>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
