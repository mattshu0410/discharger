'use client';
import type { UseMutationResult } from '@tanstack/react-query';
import type { ColumnDef } from '@tanstack/react-table';
import type { memoryFile } from '@/types/files';
import { ArrowUpDown, Building2, ClipboardCopy, Eye, File, FileText, MoreHorizontal, Trash2, User } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const createColumns = (
  deleteDocument: UseMutationResult<any, Error, string, unknown>,
  onPreviewDocument: (document: memoryFile) => void,
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
            return <File className="h-5 w-5 text-red-600" />;
          case 'doc':
          case 'docx':
            return <FileText className="h-5 w-5 text-blue-600" />;
          default:
            return <File className="h-5 w-5 text-gray-600" />;
        }
      };

      return (
        <div className="flex items-center gap-3 min-w-0">
          {getFileIcon()}
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
      const truncatedSummary = summary.length > 50 ? `${summary.slice(0, 50)}...` : summary;

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
          <Badge variant={isUser ? 'default' : 'secondary'} className="text-xs flex items-center gap-1">
            {isUser
              ? (
                  <>
                    <User className="h-3 w-3" />
                    {' '}
                    You
                  </>
                )
              : (
                  <>
                    <Building2 className="h-3 w-3" />
                    {' '}
                    Community
                  </>
                )}
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
              onClick={() => onPreviewDocument(row.original)}
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              Preview document
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                navigator.clipboard.writeText(row.original.summary);
                toast.success('Summary copied to clipboard');
              }}
              className="flex items-center gap-2"
            >
              <ClipboardCopy className="h-4 w-4" />
              Copy summary
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                navigator.clipboard.writeText(row.original.fileName);
                toast.success('Filename copied to clipboard');
              }}
              className="flex items-center gap-2"
            >
              <File className="h-4 w-4" />
              Copy filename
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:bg-destructive/10 focus:text-destructive flex items-center gap-2"
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
              <Trash2 className="h-4 w-4" />
              Remove Document
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },

];
