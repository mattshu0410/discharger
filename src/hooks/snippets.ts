import type { Snippet } from '@/types';
import { CreateSnippetRequest, UpdateSnippetRequest } from '@/api/snippets/types';

// Mock snippet data
const mockSnippets: Snippet[] = [
  {
    id: 'snippet-1',
    userId: 'user-1',
    shortcut: 'orthonote',
    content: 'Orthopedic consultation note: Patient presents with chief complaint of [COMPLAINT]. Physical examination reveals [FINDINGS]. Assessment: [DIAGNOSIS]. Plan: [TREATMENT].',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: 'snippet-2',
    userId: 'user-1',
    shortcut: 'admitorders',
    content: `Admit to: [UNIT]
Diagnosis: [DIAGNOSIS]
Condition: [STABLE/GUARDED/CRITICAL]
Vitals: Per unit protocol
Activity: [BED REST/OOB/AMBULATE]
Diet: [NPO/CARDIAC/REGULAR]
IV: [TYPE] @ [RATE]
Labs: CBC, BMP, [ADDITIONAL]
Medications: [LIST]
Consults: [SERVICES]`,
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20'),
  },
  {
    id: 'snippet-3',
    userId: 'user-1',
    shortcut: 'dischargeinst',
    content: `Discharge Instructions:
- Follow up with [PROVIDER] in [TIMEFRAME]
- Take medications as prescribed
- Return to ED for: fever > 101°F, severe pain, shortness of breath, [SPECIFIC SYMPTOMS]
- Activity restrictions: [RESTRICTIONS]
- Diet: [INSTRUCTIONS]`,
    createdAt: new Date('2024-01-25'),
    updatedAt: new Date('2024-01-25'),
  },
  {
    id: 'snippet-4',
    userId: 'user-1',
    shortcut: 'hpi',
    content: 'History of Present Illness: [AGE] year old [SEX] with PMH significant for [CONDITIONS] who presents with [CHIEF COMPLAINT] x [DURATION]. Associated symptoms include [SYMPTOMS]. Denies [PERTINENT NEGATIVES].',
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01'),
  },
  {
    id: 'snippet-5',
    userId: 'user-1',
    shortcut: 'ros',
    content: `Review of Systems:
Constitutional: [Denies fever, chills, weight loss]
HEENT: [Denies headache, vision changes, hearing loss]
Cardiovascular: [Denies chest pain, palpitations, edema]
Respiratory: [Denies SOB, cough, wheezing]
GI: [Denies abdominal pain, N/V, diarrhea]
GU: [Denies dysuria, hematuria]
MSK: [Denies joint pain, swelling]
Neuro: [Denies weakness, numbness, tingling]
Psych: [Denies depression, anxiety]
All other systems reviewed and negative`,
    createdAt: new Date('2024-02-05'),
    updatedAt: new Date('2024-02-05'),
  },
  {
    id: 'snippet-6',
    userId: 'user-1',
    shortcut: 'petemplate',
    content: `Physical Examination:
Vitals: T [TEMP] HR [HR] BP [BP] RR [RR] O2 [O2SAT]
General: [Alert and oriented x3, no acute distress]
HEENT: [NCAT, PERRLA, EOMI, TMs clear]
Neck: [Supple, no LAD, no JVD]
CV: [RRR, no M/R/G]
Lungs: [CTAB, no W/R/R]
Abd: [Soft, NT/ND, +BS]
Ext: [No C/C/E, pulses 2+ bilaterally]
Neuro: [CN II-XII intact, strength 5/5 throughout]
Skin: [Warm, dry, intact]`,
    createdAt: new Date('2024-02-10'),
    updatedAt: new Date('2024-02-10'),
  }
];

// Get all snippets for current user
export async function getAllSnippets(userId?: string): Promise<Snippet[]> {
  await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
  // In real app, would filter by userId
  return mockSnippets;
}

// Search snippets
export async function searchSnippets(query: string, userId?: string): Promise<Snippet[]> {
  await new Promise(resolve => setTimeout(resolve, 100)); // Simulate network delay
  
  const lowerQuery = query.toLowerCase();
  return mockSnippets.filter(snippet => 
    snippet.shortcut.toLowerCase().includes(lowerQuery) ||
    snippet.content.toLowerCase().includes(lowerQuery)
  );
}

// Get snippet by ID
export async function getSnippetById(id: string): Promise<Snippet | null> {
  await new Promise(resolve => setTimeout(resolve, 100)); // Simulate network delay
  return mockSnippets.find(snippet => snippet.id === id) || null;
}

// Get snippet by shortcut
export async function getSnippetByShortcut(shortcut: string, userId?: string): Promise<Snippet | null> {
  await new Promise(resolve => setTimeout(resolve, 100)); // Simulate network delay
  return mockSnippets.find(snippet => snippet.shortcut === shortcut) || null;
}

// Create new snippet
export async function createSnippet(data: CreateSnippetRequest): Promise<Snippet> {
  await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
  
  const newSnippet: Snippet = {
    id: `snippet-${Date.now()}`,
    userId: 'user-1', // In real app, get from auth
    shortcut: data.shortcut,
    content: data.content,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  mockSnippets.push(newSnippet);
  return newSnippet;
}

// Update snippet
export async function updateSnippet(id: string, data: UpdateSnippetRequest): Promise<Snippet> {
  await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
  
  const snippet = mockSnippets.find(s => s.id === id);
  if (!snippet) {
    throw new Error('Snippet not found');
  }
  
  if (data.shortcut) snippet.shortcut = data.shortcut;
  if (data.content) snippet.content = data.content;
  snippet.updatedAt = new Date();
  
  return snippet;
}

// Delete snippet
export async function deleteSnippet(id: string): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 200)); // Simulate network delay
  
  const index = mockSnippets.findIndex(s => s.id === id);
  if (index === -1) {
    throw new Error('Snippet not found');
  }
  
  mockSnippets.splice(index, 1);
} 