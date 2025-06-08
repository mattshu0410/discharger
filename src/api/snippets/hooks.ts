import type { CreateSnippetRequest, UpdateSnippetRequest } from '@/api/snippets/types';
import type { Snippet } from '@/types';

// Get all snippets for current user
export async function getAllSnippets(): Promise<Snippet[]> {
  const response = await fetch('/api/snippets');

  if (!response.ok) {
    throw new Error('Failed to fetch snippets');
  }

  return response.json();
}

// Search snippets
export async function searchSnippets(query: string): Promise<Snippet[]> {
  if (!query.trim()) {
    return [];
  }

  const response = await fetch(`/api/snippets?q=${encodeURIComponent(query)}`);

  if (!response.ok) {
    throw new Error('Failed to search snippets');
  }

  return response.json();
}

// Get snippet by ID
export async function getSnippetById(id: string): Promise<Snippet | null> {
  const response = await fetch(`/api/snippets/${id}`);

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    throw new Error('Failed to fetch snippet');
  }

  return response.json();
}

// Get snippet by shortcut
export async function getSnippetByShortcut(shortcut: string): Promise<Snippet | null> {
  const response = await fetch(`/api/snippets/shortcut/${encodeURIComponent(shortcut)}`);

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    throw new Error('Failed to fetch snippet');
  }

  return response.json();
}

// Create new snippet
export async function createSnippet(data: CreateSnippetRequest): Promise<Snippet> {
  const response = await fetch('/api/snippets', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      shortcut: data.shortcut,
      content: data.content,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to create snippet');
  }

  return response.json();
}

// Update snippet
export async function updateSnippet(id: string, data: UpdateSnippetRequest): Promise<Snippet> {
  const response = await fetch(`/api/snippets/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      shortcut: data.shortcut,
      content: data.content,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to update snippet');
  }

  return response.json();
}

// Delete snippet
export async function deleteSnippet(id: string): Promise<void> {
  const response = await fetch(`/api/snippets/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete snippet');
  }
}
