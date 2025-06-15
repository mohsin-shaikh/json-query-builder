import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

interface QueryInputProps {
  query: string
  loading: boolean
  filterTime: number | null
  onQueryChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  onApplyFilter: () => void
}

export function QueryInput({
  query,
  loading,
  filterTime,
  onQueryChange,
  onApplyFilter,
}: QueryInputProps) {
  return (
    <div>
      <h3 className="block mb-2">JSON Query</h3>
      <Textarea 
        className="w-full" 
        rows={10} 
        value={query}
        onChange={onQueryChange}
        placeholder="Enter your query here..."
      />
      <div className="mt-2 flex items-center gap-4">
        <Button onClick={onApplyFilter} disabled={loading}>
          {loading ? 'Loading...' : 'Apply Filter'}
        </Button>
        {filterTime !== null && (
          <span className="text-sm text-muted-foreground">
            Filter time: {filterTime.toFixed(2)}ms
          </span>
        )}
      </div>
    </div>
  )
} 