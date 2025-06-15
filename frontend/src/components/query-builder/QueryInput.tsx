import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { useEffect, useState, useRef } from 'react'
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent } from '@/components/ui/popover'
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
  const [cursorPosition, setCursorPosition] = useState({ top: 0, left: 0 })

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
    const textarea = e.target
    const cursorPos = textarea.selectionStart
    
    // Calculate cursor position in pixels
    const textBeforeCursor = newValue.slice(0, cursorPos)
    const lines = textBeforeCursor.split('\n')
    const currentLine = lines.length - 1
    const currentLineText = lines[currentLine]
    
    // Create a temporary span to measure text width
    const span = document.createElement('span')
    span.style.visibility = 'hidden'
    span.style.position = 'absolute'
    span.style.whiteSpace = 'pre'
    span.style.font = window.getComputedStyle(textarea).font
    span.textContent = currentLineText
    document.body.appendChild(span)
    
    const textWidth = span.offsetWidth
    document.body.removeChild(span)
    
    // Calculate position
    const lineHeight = Number.parseInt(window.getComputedStyle(textarea).lineHeight)
    const top = textarea.offsetTop + (currentLine + 1) * lineHeight
    const left = textarea.offsetLeft + textWidth
    
    setCursorPosition({ top, left })
    
    // Extract the word being typed
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
      <div className="relative">
        <Textarea 
          ref={textareaRef}
          className="w-full font-mono" 
          rows={10} 
          value={query}
          onChange={handleTextAreaChange}
          placeholder="Enter your query here..."
        />
        <Popover open={open && suggestions.length > 0} onOpenChange={setOpen}>
          <PopoverContent 
            className="w-[200px] p-0" 
            align="start"
            side="bottom"
            sideOffset={5}
            style={{ 
              position: 'absolute',
              top: `${cursorPosition.top}px`,
              left: `${cursorPosition.left}px`
            }}
          >
            <Command>
              <CommandList>
                <CommandEmpty>No fields found.</CommandEmpty>
                <CommandGroup>
                  {suggestions.map((suggestion) => (
                    <CommandItem
                      key={suggestion}
                      onSelect={() => insertSuggestion(suggestion)}
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
      </div>
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