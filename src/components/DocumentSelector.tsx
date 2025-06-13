'use client';
import type { DocumentSearchResult } from '@/types';
import { useSearchDocuments } from '@/api/documents/queries';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverAnchor, PopoverContent } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/libs/utils';
import { useUIStore } from '@/stores/uiStore';
import { FileText, Search as SearchIcon } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

type DocumentSelectorProps = {
  onSelect: (document: DocumentSearchResult['document']) => void;
};

// Moved PopoverTriggerComponent to the top level
const PopoverTriggerComponent = ({ position }: { position: { x: number; y: number } | null }) => {
  if (!position) {
    return null;
  }
  return <PopoverAnchor style={{ position: 'fixed', top: position.y, left: position.x, width: 0, height: 0 }} />;
};

export function DocumentSelector({ onSelect }: DocumentSelectorProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const isOpen = useUIStore(state => state.isDocumentSelectorOpen);
  const position = useUIStore(state => state.documentSelectorPosition);
  const searchQuery = useUIStore(state => state.documentSearchQuery);
  const closeDocumentSelector = useUIStore(state => state.closeDocumentSelector);
  const setDocumentSearchQuery = useUIStore(state => state.setDocumentSearchQuery);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const { data: searchResults = [], isLoading } = useSearchDocuments(searchQuery, isOpen);

  useEffect(() => {
    if (searchResults.length > 0) {
      setSelectedIndex(0);
    }
    itemRefs.current = [];
  }, [searchResults, searchQuery]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    }
  }, [isOpen]);

  const handleSelect = useCallback((doc: DocumentSearchResult['document']) => {
    onSelect(doc);
    setDocumentSearchQuery('');
    closeDocumentSelector();
  }, [onSelect, setDocumentSearchQuery, closeDocumentSelector]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, searchResults.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (searchResults[selectedIndex]) {
          handleSelect(searchResults[selectedIndex].document);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        closeDocumentSelector();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, searchResults, selectedIndex, handleSelect, closeDocumentSelector]);

  useEffect(() => {
    if (isOpen && searchResults.length > 0 && selectedIndex >= 0 && itemRefs.current[selectedIndex]) {
      itemRefs.current[selectedIndex]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [selectedIndex, isOpen, searchResults]);

  if (!isOpen || !position) {
    return null;
  }

  return (
    <Popover open={isOpen} onOpenChange={open => !open && closeDocumentSelector()}>
      <PopoverTriggerComponent position={position} />
      <PopoverContent
        className="w-96 shadow-lg p-0"
        side="bottom"
        align="start"
        sideOffset={5}
      >
        <div className="p-2">
          <div className="relative mb-2">
            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              placeholder="Search documents..."
              className="pl-8"
              value={searchQuery}
              onChange={e => setDocumentSearchQuery(e.target.value)}
            />
          </div>
          <ScrollArea className="h-[250px]" ref={scrollContainerRef}>
            <div className="space-y-1 pr-2">
              {isLoading && (
                <div className="p-3 text-center text-sm text-muted-foreground">Searching...</div>
              )}
              {!isLoading && searchResults.length === 0 && (
                <div className="p-3 text-center text-sm text-muted-foreground">No documents found.</div>
              )}
              {!isLoading && searchResults.length > 0 && (
                searchResults.map((result, index) => (
                  <Button
                    key={result.document.id}
                    ref={(el) => {
                      itemRefs.current[index] = el;
                    }}
                    variant="ghost"
                    className={cn(
                      'w-full h-auto justify-start text-left p-2',
                      index === selectedIndex && 'bg-accent text-accent-foreground',
                    )}
                    onClick={() => handleSelect(result.document)}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    <FileText className="h-4 w-4 mr-2 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">
                        {result.document.filename}
                      </div>
                      {result.document.summary && (
                        <div className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                          {result.document.summary}
                        </div>
                      )}
                      {result.document.tags && result.document.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {result.document.tags.slice(0, 3).map(tag => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
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
