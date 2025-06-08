'use client';

import type { Snippet } from '@/types';
import { useCreateSnippet, useDeleteSnippet, useSnippets, useUpdateSnippet } from '@/api/snippets/queries';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useUIStore } from '@/stores';
import { Edit, Plus, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';

type SnippetFormData = {
  shortcut: string;
  content: string;
};

function SnippetForm({
  snippet,
  onSubmit,
  onCancel,
  isLoading,
}: {
  snippet?: Snippet;
  onSubmit: (data: SnippetFormData) => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState<SnippetFormData>({
    shortcut: snippet?.shortcut || '',
    content: snippet?.content || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.shortcut.trim() && formData.content.trim()) {
      onSubmit(formData);
    }
  };

  const bracketCount = (formData.content.match(/\[([^\]]+)\]/g) || []).length;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="shortcut" className="block text-sm font-medium mb-1">
          Shortcut
        </label>
        <Input
          id="shortcut"
          placeholder="e.g., orthonote, cardnote"
          value={formData.shortcut}
          onChange={e => setFormData(prev => ({ ...prev, shortcut: e.target.value }))}
          disabled={isLoading}
          required
        />
        <p className="text-xs text-muted-foreground mt-1">
          Type /
          {formData.shortcut || 'shortcut'}
          {' '}
          to insert this snippet
        </p>
      </div>

      <div>
        <label htmlFor="content" className="block text-sm font-medium mb-1">
          Content
        </label>
        <Textarea
          id="content"
          placeholder="Enter your snippet content here..."
          value={formData.content}
          onChange={e => setFormData(prev => ({ ...prev, content: e.target.value }))}
          disabled={isLoading}
          required
          rows={8}
          className="font-mono text-sm"
        />
        {bracketCount > 0 && (
          <div className="flex items-center gap-1 mt-1">
            <Badge variant="secondary" className="text-xs">
              {bracketCount}
              {' '}
              tab stop
              {bracketCount !== 1 ? 's' : ''}
            </Badge>
            <p className="text-xs text-muted-foreground">
              Use [PLACEHOLDER] for tab-through fields
            </p>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading || !formData.shortcut.trim() || !formData.content.trim()}>
          {snippet ? 'Update' : 'Create'}
          {' '}
          Snippet
        </Button>
      </div>
    </form>
  );
}

function DeleteConfirmDialog({
  snippet,
  onConfirm,
  onCancel,
  isLoading,
}: {
  snippet: Snippet;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  return (
    <div className="space-y-4">
      <p>
        Are you sure you want to delete the snippet "
        {snippet.shortcut}
        "?
      </p>
      <p className="text-sm text-muted-foreground">This action cannot be undone.</p>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button variant="destructive" onClick={onConfirm} disabled={isLoading}>
          Delete Snippet
        </Button>
      </div>
    </div>
  );
}

export default function SnippetsPage() {
  const { data: snippets = [], isLoading } = useSnippets();
  const createSnippet = useCreateSnippet();
  const updateSnippet = useUpdateSnippet();
  const deleteSnippet = useDeleteSnippet();

  const searchQuery = useUIStore(state => state.memorySearchQuery);
  const setSearchQuery = useUIStore(state => state.setMemorySearchQuery);

  const [dialogState, setDialogState] = useState<{
    type: 'create' | 'edit' | 'delete' | null;
    snippet?: Snippet;
  }>({ type: null });

  const filteredSnippets = snippets.filter(snippet =>
    snippet.shortcut.toLowerCase().includes(searchQuery.toLowerCase())
    || snippet.content.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleCreateSubmit = (data: SnippetFormData) => {
    createSnippet.mutate(data, {
      onSuccess: () => {
        setDialogState({ type: null });
      },
    });
  };

  const handleEditSubmit = (data: SnippetFormData) => {
    if (!dialogState.snippet) {
      return;
    }

    updateSnippet.mutate(
      { id: dialogState.snippet.id, data },
      {
        onSuccess: () => {
          setDialogState({ type: null });
        },
      },
    );
  };

  const handleDeleteConfirm = () => {
    if (!dialogState.snippet) {
      return;
    }

    deleteSnippet.mutate(dialogState.snippet.id, {
      onSuccess: () => {
        setDialogState({ type: null });
      },
    });
  };

  const isDialogOpen = dialogState.type !== null;
  const isMutating = createSnippet.isPending || updateSnippet.isPending || deleteSnippet.isPending;

  return (
    <div className="space-y-6 m-16">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Snippets</h1>
          <p className="text-muted-foreground">Manage your text snippets for quick insertion</p>
        </div>
        <Button onClick={() => setDialogState({ type: 'create' })}>
          <Plus className="h-4 w-4 mr-2" />
          New Snippet
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search snippets..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {isLoading
        ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading snippets...
            </div>
          )
        : filteredSnippets.length === 0
          ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchQuery ? 'No snippets found matching your search.' : 'No snippets yet. Create your first snippet to get started.'}
              </div>
            )
          : (
              <div className="grid gap-4">
                {filteredSnippets.map(snippet => (
                  <div key={snippet.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            /
                            {snippet.shortcut}
                          </Badge>
                          {snippet.content.includes('[') && (
                            <Badge variant="secondary" className="text-xs">
                              {(snippet.content.match(/\[([^\]]+)\]/g) || []).length}
                              {' '}
                              tab stops
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Created
                          {' '}
                          {new Date(snippet.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDialogState({ type: 'edit', snippet })}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDialogState({ type: 'delete', snippet })}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="bg-muted rounded-md p-3">
                      <pre className="text-sm whitespace-pre-wrap font-mono overflow-x-auto">
                        {snippet.content}
                      </pre>
                    </div>
                  </div>
                ))}
              </div>
            )}

      <Dialog open={isDialogOpen} onOpenChange={open => !open && setDialogState({ type: null })}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {dialogState.type === 'create' && 'Create New Snippet'}
              {dialogState.type === 'edit' && 'Edit Snippet'}
              {dialogState.type === 'delete' && 'Delete Snippet'}
            </DialogTitle>
          </DialogHeader>

          {dialogState.type === 'create' && (
            <SnippetForm
              onSubmit={handleCreateSubmit}
              onCancel={() => setDialogState({ type: null })}
              isLoading={isMutating}
            />
          )}

          {dialogState.type === 'edit' && dialogState.snippet && (
            <SnippetForm
              snippet={dialogState.snippet}
              onSubmit={handleEditSubmit}
              onCancel={() => setDialogState({ type: null })}
              isLoading={isMutating}
            />
          )}

          {dialogState.type === 'delete' && dialogState.snippet && (
            <DeleteConfirmDialog
              snippet={dialogState.snippet}
              onConfirm={handleDeleteConfirm}
              onCancel={() => setDialogState({ type: null })}
              isLoading={isMutating}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
