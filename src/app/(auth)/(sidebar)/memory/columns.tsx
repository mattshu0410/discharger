'use client';
import type { memoryFile } from '@/types/files';
import type { UseMutationResult } from '@tanstack/react-query';
import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ArrowUpDown, MoreHorizontal } from 'lucide-react';
import { toast } from 'sonner';

export const createColumns = (
  deleteDocument: UseMutationResult<any, Error, string, unknown>,
): ColumnDef<memoryFile>[] => [
  {
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          File Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    accessorKey: 'fileName',
    cell: ({ row }) => {
      return (
        <div className="text-left font-medium" title={row.original.fileName}>
          {row.original.fileName}
        </div>
      );
    },
  },
  {
    header: 'Summary',
    accessorKey: 'summary',
    cell: ({ row }) => {
      return (
        <div className="text-left" title={row.original.summary}>
          {row.original.summary}
        </div>
      );
    },
  },
  {
    header: 'Tags',
    accessorKey: 'tags',
    cell: ({ row }) => {
      return (
        <div className="flex flex-wrap gap-1">
          {row.original.tags.map(tag => (
            <Badge
              key={tag}
              variant="outline"
              className="text-xs whitespace-nowrap"
            >
              {tag}
            </Badge>
          ))}
        </div>
      );
    },
  },
  {
    header: 'Source',
    accessorKey: 'source',
    cell: ({ row }) => {
      return (
        <div className="text-left truncate" title={row.original.source}>
          {row.original.source}
        </div>
      );
    },
  },
  {
    header: '',
    accessorKey: 'actions',
    cell: ({ row }) => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(row.original.summary)}
            >
              Copy summary
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:bg-destructive/10 focus:text-destructive"
              onClick={() => {
                if (row.original.documentId) {
                  deleteDocument.mutate(row.original.documentId, {
                    onSuccess: () => {
                      toast('Document deleted successfully');
                    },
                    onError: (error) => {
                      toast('Error deleting document', {
                        description: error.message,
                      });
                    },
                  });
                }
              }}
            >
              Remove Document
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },

];
