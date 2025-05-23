'use client';
import type { memoryFile } from '@/types/files';
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

export const columns: ColumnDef<memoryFile>[] = [
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
        <div className="text-left font-medium">
          {row.original.fileName}
        </div>
      );
    },
  },
  {
    header: 'Summary',
    accessorKey: 'summary',
  },
  {
    header: 'Tags',
    accessorKey: 'tags',
    cell: ({ row }) => {
      return (
        <div className="text-left font-medium">
          {row.original.tags.map(tag => (
            <Badge
              key={tag}
              variant="outline"
              className="mr-1"
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
            <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive">Remove Document</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },

];
