import { useEffect, useState } from 'react'
import { QueryInput } from './components/query-builder/QueryInput'
import { DataTable } from './components/query-builder/DataTable'

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

function App() {
  const [query, setQuery] = useState('')
  const [filteredData, setFilteredData] = useState<DataItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filterTime, setFilterTime] = useState<number | null>(null)

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true)
        const startTime = performance.now()
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
        const endTime = performance.now()
        setFilterTime(endTime - startTime)
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
      const startTime = performance.now()
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
      const endTime = performance.now()
      setFilterTime(endTime - startTime)
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
        <QueryInput
          query={query}
          loading={loading}
          filterTime={filterTime}
          onQueryChange={handleQueryChange}
          onApplyFilter={applyFilter}
        />

        {error && (
          <div className="text-red-500">
            Error: {error}
          </div>
        )}

        <DataTable data={filteredData} />
      </div>
    </div>
  )
}

export default App
