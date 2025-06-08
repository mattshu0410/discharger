import type { Snippet, SnippetSearchResult } from '@/types';

// Mock data - in a real app, this would come from your database
const mockSnippets: Snippet[] = [
  {
    id: 'snippet-1',
    userId: '00000000-0000-0000-0000-000000000000',
    shortcut: 'vitals',
    content: 'Patient presented with stable vital signs throughout admission. Blood pressure remained within normal limits (110-130/70-80 mmHg), heart rate regular at 60-80 bpm, respiratory rate 16-20 breaths per minute, and oxygen saturation >95% on room air.',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: 'snippet-2',
    userId: '00000000-0000-0000-0000-000000000000',
    shortcut: 'meds',
    content: 'Patient demonstrated good understanding of medication regimen and importance of compliance. Educated on proper dosing schedules, potential side effects, and when to contact healthcare provider.',
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20'),
  },
  {
    id: 'snippet-3',
    userId: '00000000-0000-0000-0000-000000000000',
    shortcut: 'followup',
    content: 'Patient advised to follow up with primary care physician within 1-2 weeks. Return to ED immediately if experiencing worsening symptoms, chest pain, shortness of breath, or any concerning changes.',
    createdAt: new Date('2024-01-25'),
    updatedAt: new Date('2024-01-25'),
  },
  {
    id: 'snippet-4',
    userId: '00000000-0000-0000-0000-000000000000',
    shortcut: 'diet',
    content: 'Patient counseled on heart-healthy diet with low sodium (<2g/day), limited saturated fats, and emphasis on fruits, vegetables, and whole grains. Referred to nutritionist for detailed meal planning.',
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01'),
  },
];

// Get all snippets for the current user
export async function getAllSnippets(_userId?: string): Promise<Snippet[]> {
  await new Promise(resolve => setTimeout(resolve, 200)); // Simulate network delay

  // In a real app, filter by userId
  return mockSnippets;
}

// Search snippets by query
export async function searchSnippets(query: string, _userId?: string): Promise<SnippetSearchResult[]> {
  await new Promise(resolve => setTimeout(resolve, 150)); // Simulate network delay

  if (!query.trim()) {
    return [];
  }

  const searchTerm = query.toLowerCase();

  const results = mockSnippets
    .filter((snippet) => {
      // In a real app, you'd also filter by userId
      return (
        snippet.shortcut.toLowerCase().includes(searchTerm)
        || snippet.content.toLowerCase().includes(searchTerm)
      );
    })
    .map(snippet => ({
      snippet,
      relevanceScore: calculateRelevanceScore(snippet, searchTerm),
      matchedText: getMatchedText(snippet, searchTerm),
    }))
    .sort((a, b) => b.relevanceScore - a.relevanceScore);

  return results;
}

// Get snippets by IDs
export async function getSnippetsByIds(ids: string[]): Promise<Snippet[]> {
  await new Promise(resolve => setTimeout(resolve, 100)); // Simulate network delay

  if (ids.length === 0) {
    return [];
  }

  return mockSnippets.filter(snippet => ids.includes(snippet.id));
}

// Get a single snippet by ID
export async function getSnippetById(id: string): Promise<Snippet | null> {
  await new Promise(resolve => setTimeout(resolve, 100)); // Simulate network delay

  return mockSnippets.find(snippet => snippet.id === id) || null;
}

// Helper function to calculate relevance score
function calculateRelevanceScore(snippet: Snippet, searchTerm: string): number {
  let score = 0;

  // Shortcut match (highest weight)
  if (snippet.shortcut.toLowerCase().includes(searchTerm)) {
    score += 10;
  }

  // Content match (lower weight)
  if (snippet.content.toLowerCase().includes(searchTerm)) {
    score += 1;
  }

  return score;
}

// Helper function to get matched text snippet
function getMatchedText(snippet: Snippet, searchTerm: string): string {
  const content = snippet.content.toLowerCase();
  const index = content.indexOf(searchTerm);

  if (index === -1) {
    return `${snippet.content.substring(0, 100)}...`;
  }

  const start = Math.max(0, index - 50);
  const end = Math.min(snippet.content.length, index + searchTerm.length + 50);

  return `...${snippet.content.substring(start, end)}...`;
}
