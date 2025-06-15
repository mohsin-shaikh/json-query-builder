import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { useEffect, useState, useRef } from 'react'
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { API_BASE_URL } from '@/config'

interface QueryInputProps {
  query: string
  loading: boolean
  filterTime: number | null
  onQueryChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  onApplyFilter: () => void
  filePath: string
}

export function QueryInput({
  query,
  loading,
  filterTime,
  onQueryChange,
  onApplyFilter,
  filePath,
}: QueryInputProps) {
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [open, setOpen] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!searchTerm || !filePath) return
      try {
        const response = await fetch(`${API_BASE_URL}/api/suggestions?searchTerm=${encodeURIComponent(searchTerm)}&filePath=${encodeURIComponent(filePath)}`)
        const data = await response.json()
        if (data.success) {
          setSuggestions(data.suggestions)
        }
      } catch (error) {
        console.error('Error fetching suggestions:', error)
      }
    }
    const debounceTimer = setTimeout(fetchSuggestions, 300)
    return () => clearTimeout(debounceTimer)
  }, [searchTerm, filePath])

  const handleTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    // Extract the word being typed (last word on the current line)
    const textarea = e.target
    const cursorPos = textarea.selectionStart
    const textBeforeCursor = newValue.slice(0, cursorPos)
    const lines = textBeforeCursor.split('\n')
    const currentLineText = lines[lines.length - 1]
    const words = currentLineText.split(/\s+/)
    const currentWord = words[words.length - 1]
    setSearchTerm(currentWord)
    setOpen(true)
    onQueryChange(e)
  }

  const insertSuggestion = (suggestion: string) => {
    const textarea = textareaRef.current
    if (!textarea) return
    const cursorPos = textarea.selectionStart
    const textBeforeCursor = query.slice(0, cursorPos)
    const textAfterCursor = query.slice(cursorPos)
    const lines = textBeforeCursor.split('\n')
    const currentLine = lines.length - 1
    const currentLineText = lines[currentLine]
    const words = currentLineText.split(/\s+/)
    words[words.length - 1] = suggestion
    const newText = [
      ...lines.slice(0, currentLine),
      words.join(' '),
      textAfterCursor
    ].join('\n')
    onQueryChange({ target: { value: newText } } as React.ChangeEvent<HTMLTextAreaElement>)
    setOpen(false)
  }

  return (
    <div>
      <h3 className="block mb-2">JSON Query</h3>
      <Popover open={open && suggestions.length > 0} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Textarea
            ref={textareaRef}
            className="w-full font-mono"
            rows={10}
            value={query}
            onChange={handleTextAreaChange}
            placeholder="Enter your query here..."
            onFocus={() => searchTerm && setOpen(true)}
          />
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0" align="start" side="bottom" sideOffset={4}>
          <Command>
            <CommandList>
              <CommandEmpty>No fields found.</CommandEmpty>
              <CommandGroup>
                {suggestions.map((suggestion) => (
                  <CommandItem
                    key={suggestion}
                    onMouseDown={e => {
                      e.preventDefault();
                      insertSuggestion(suggestion);
                    }}
                    className="cursor-pointer"
                  >
                    {suggestion}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
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