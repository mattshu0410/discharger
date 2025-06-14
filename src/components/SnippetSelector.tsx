'use client';
import type { Snippet } from '@/types';
import { Slash } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchSnippets, useSnippets } from '@/api/snippets/queries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverAnchor, PopoverContent } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/libs/utils';
import { useUIStore } from '@/stores/uiStore';

type SnippetSelectorProps = {
  onSelect: (snippet: Snippet) => void;
};

// Popover trigger component positioned at cursor
const PopoverTriggerComponent = ({ position }: { position: { x: number; y: number } | null }) => {
  if (!position) {
    return null;
  }
  return <PopoverAnchor style={{ position: 'fixed', top: position.y, left: position.x, width: 0, height: 0 }} />;
};

export function SnippetSelector({ onSelect }: SnippetSelectorProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const isOpen = useUIStore(state => state.isSnippetSelectorOpen);
  const position = useUIStore(state => state.snippetSelectorPosition);
  const searchQuery = useUIStore(state => state.snippetSearchQuery);
  const closeSnippetSelector = useUIStore(state => state.closeSnippetSelector);
  const setSnippetSearchQuery = useUIStore(state => state.setSnippetSearchQuery);

  const [selectedIndex, setSelectedIndex] = useState(0);

  // Use different hooks based on whether we have a search query
  const { data: allSnippets = [], isLoading: isLoadingAll } = useSnippets();
  const { data: searchResults = [], isLoading: isLoadingSearch } = useSearchSnippets(
    searchQuery,
    !!searchQuery.trim(),
  );

  // Determine which data to use
  const hasSearchQuery = !!searchQuery.trim();
  const snippets = hasSearchQuery ? searchResults : allSnippets;
  const isLoading = hasSearchQuery ? isLoadingSearch : isLoadingAll;

  // Reset selection when results change
  useEffect(() => {
    if (snippets.length > 0) {
      setSelectedIndex(0);
    }
    itemRefs.current = [];
  }, [snippets, searchQuery]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    }
  }, [isOpen]);

  const handleSelect = useCallback((snippet: Snippet) => {
    onSelect(snippet);
    setSnippetSearchQuery('');
    closeSnippetSelector();
  }, [onSelect, setSnippetSearchQuery, closeSnippetSelector]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, snippets.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (snippets[selectedIndex]) {
          handleSelect(snippets[selectedIndex]);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        closeSnippetSelector();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, snippets, selectedIndex, handleSelect, closeSnippetSelector]);

  // Scroll selected item into view
  useEffect(() => {
    if (isOpen && snippets.length > 0 && selectedIndex >= 0 && itemRefs.current[selectedIndex]) {
      itemRefs.current[selectedIndex]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [selectedIndex, isOpen, snippets]);

  if (!isOpen || !position) {
    return null;
  }

  return (
    <Popover open={isOpen} onOpenChange={open => !open && closeSnippetSelector()}>
      <PopoverTriggerComponent position={position} />
      <PopoverContent
        className="w-96 shadow-lg p-0"
        side="bottom"
        align="start"
        sideOffset={5}
      >
        <div className="p-2">
          <div className="relative mb-2">
            <Slash className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              placeholder="Search snippets..."
              className="pl-8"
              value={searchQuery}
              onChange={e => setSnippetSearchQuery(e.target.value)}
            />
          </div>
          <ScrollArea className="h-[250px]" ref={scrollContainerRef}>
            <div className="space-y-1 pr-2">
              {isLoading && (
                <div className="p-3 text-center text-sm text-muted-foreground">Searching...</div>
              )}
              {!isLoading && snippets.length === 0 && (
                <div className="p-3 text-center text-sm text-muted-foreground">No snippets found.</div>
              )}
              {!isLoading && snippets.length > 0 && (
                snippets.map((snippet, index) => (
                  <Button
                    key={snippet.id}
                    ref={(el) => {
                      itemRefs.current[index] = el;
                    }}
                    variant="ghost"
                    className={cn(
                      'w-full h-auto justify-start text-left p-2',
                      index === selectedIndex && 'bg-accent text-accent-foreground',
                    )}
                    onClick={() => handleSelect(snippet)}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    <Slash className="h-4 w-4 mr-2 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-mono font-medium text-sm">
                        /
                        {snippet.shortcut}
                      </div>
                      <div className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                        {snippet.content}
                      </div>
                    </div>
                  </Button>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </PopoverContent>
    </Popover>
  );
}
