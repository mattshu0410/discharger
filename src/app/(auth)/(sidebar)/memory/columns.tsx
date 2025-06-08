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
          className="h-8 px-2 lg:px-3"
        >
          File Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    accessorKey: 'fileName',
    cell: ({ row }) => {
      const fileName = row.original.fileName;
      const fileExtension = fileName.split('.').pop()?.toLowerCase();
      const getFileIcon = () => {
        switch (fileExtension) {
          case 'pdf':
            return '📄';
          case 'doc':
          case 'docx':
            return '📝';
          default:
            return '📄';
        }
      };

      return (
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-lg">{getFileIcon()}</span>
          <div className="min-w-0 flex-1">
            <div className="font-medium truncate" title={fileName}>
              {fileName}
            </div>
            <div className="text-xs text-muted-foreground">
              {fileExtension?.toUpperCase()}
            </div>
          </div>
        </div>
      );
    },
  },
  {
    header: 'Summary',
    accessorKey: 'summary',
    cell: ({ row }) => {
      const summary = row.original.summary;
      const truncatedSummary = summary.length > 100 ? `${summary.slice(0, 100)}...` : summary;

      return (
        <div className="max-w-md">
          <div className="text-sm" title={summary}>
            {truncatedSummary}
          </div>
        </div>
      );
    },
  },
  {
    header: 'Tags',
    accessorKey: 'tags',
    cell: ({ row }) => {
      const tags = row.original.tags;
      if (tags.length === 0) {
        return <span className="text-xs text-muted-foreground">No tags</span>;
      }

      return (
        <div className="flex flex-wrap gap-1 max-w-32">
          {tags.slice(0, 2).map(tag => (
            <Badge
              key={tag}
              variant="secondary"
              className="text-xs"
            >
              {tag}
            </Badge>
          ))}
          {tags.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +
              {tags.length - 2}
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    header: 'Source',
    accessorKey: 'source',
    cell: ({ row }) => {
      const source = row.original.source;
      const isUser = source !== 'community';

      return (
        <div className="flex items-center gap-2">
          <Badge variant={isUser ? 'default' : 'secondary'} className="text-xs">
            {isUser ? '👤 You' : '🌐 Community'}
          </Badge>
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
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem
              onClick={() => {
                navigator.clipboard.writeText(row.original.summary);
                toast.success('Summary copied to clipboard');
              }}
            >
              📋 Copy summary
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                navigator.clipboard.writeText(row.original.fileName);
                toast.success('Filename copied to clipboard');
              }}
            >
              📄 Copy filename
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:bg-destructive/10 focus:text-destructive"
              onClick={() => {
                if (row.original.documentId) {
                  deleteDocument.mutate(row.original.documentId, {
                    onSuccess: () => {
                      toast.success('Document deleted successfully');
                    },
                    onError: (error) => {
                      toast.error('Error deleting document', {
                        description: error.message,
                      });
                    },
                  });
                }
              }}
            >
              🗑️ Remove Document
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },

];
