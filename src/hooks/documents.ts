import type { Document, DocumentSearchResult } from '@/types';

// Mock document data - medical guidelines and protocols
const mockDocuments: Document[] = [
  {
    id: 'doc-1',
    userId: 'user-1',
    filename: 'Hypertension_Management_Guidelines_2024.pdf',
    summary: 'Comprehensive guidelines for diagnosis and management of hypertension in adults',
    source: 'community',
    shareStatus: 'public',
    uploadedBy: 'Dr. Smith',
    uploadedAt: new Date('2024-01-15'),
    s3Url: 'https://s3.example.com/doc-1.pdf',
    tags: ['hypertension', 'cardiovascular', 'guidelines', 'blood pressure'],
    metadata: {
      pageCount: 45,
      specialty: 'Cardiology'
    }
  },
  {
    id: 'doc-2',
    userId: 'user-1',
    filename: 'Diabetes_Care_Standards_2024.pdf',
    summary: 'Standards of medical care in diabetes including glycemic targets and management algorithms',
    source: 'community',
    shareStatus: 'public',
    uploadedBy: 'Dr. Johnson',
    uploadedAt: new Date('2024-01-20'),
    s3Url: 'https://s3.example.com/doc-2.pdf',
    tags: ['diabetes', 'endocrinology', 'glycemic control', 'insulin'],
    metadata: {
      pageCount: 78,
      specialty: 'Endocrinology'
    }
  },
  {
    id: 'doc-3',
    userId: 'user-2',
    filename: 'Asthma_Treatment_Protocol.pdf',
    summary: 'Evidence-based protocols for acute and chronic asthma management',
    source: 'user',
    shareStatus: 'private',
    uploadedBy: 'Dr. Williams',
    uploadedAt: new Date('2024-02-01'),
    s3Url: 'https://s3.example.com/doc-3.pdf',
    tags: ['asthma', 'respiratory', 'inhaler', 'bronchodilators'],
    metadata: {
      pageCount: 32,
      specialty: 'Pulmonology'
    }
  },
  {
    id: 'doc-4',
    userId: 'user-1',
    filename: 'Heart_Failure_Guidelines.pdf',
    summary: 'Guidelines for diagnosis and management of heart failure with reduced and preserved ejection fraction',
    source: 'community',
    shareStatus: 'public',
    uploadedBy: 'Dr. Brown',
    uploadedAt: new Date('2024-01-25'),
    s3Url: 'https://s3.example.com/doc-4.pdf',
    tags: ['heart failure', 'cardiology', 'ejection fraction', 'diuretics'],
    metadata: {
      pageCount: 56,
      specialty: 'Cardiology'
    }
  },
  {
    id: 'doc-5',
    userId: 'user-1',
    filename: 'Anticoagulation_Therapy_Guide.pdf',
    summary: 'Practical guide for anticoagulation therapy including dosing and monitoring',
    source: 'community',
    shareStatus: 'public',
    uploadedBy: 'Dr. Davis',
    uploadedAt: new Date('2024-02-05'),
    s3Url: 'https://s3.example.com/doc-5.pdf',
    tags: ['anticoagulation', 'warfarin', 'DOACs', 'INR monitoring'],
    metadata: {
      pageCount: 28,
      specialty: 'Hematology'
    }
  },
  {
    id: 'doc-6',
    userId: 'user-3',
    filename: 'COPD_Management_2024.pdf',
    summary: 'Comprehensive approach to COPD diagnosis, staging, and treatment options',
    source: 'community',
    shareStatus: 'public',
    uploadedBy: 'Dr. Miller',
    uploadedAt: new Date('2024-01-30'),
    s3Url: 'https://s3.example.com/doc-6.pdf',
    tags: ['COPD', 'respiratory', 'spirometry', 'bronchodilators'],
    metadata: {
      pageCount: 42,
      specialty: 'Pulmonology'
    }
  },
  {
    id: 'doc-7',
    userId: 'user-1',
    filename: 'Acute_MI_Protocol.pdf',
    summary: 'Time-critical protocols for acute myocardial infarction management',
    source: 'user',
    shareStatus: 'private',
    uploadedBy: 'Dr. Wilson',
    uploadedAt: new Date('2024-02-10'),
    s3Url: 'https://s3.example.com/doc-7.pdf',
    tags: ['myocardial infarction', 'STEMI', 'PCI', 'thrombolytics'],
    metadata: {
      pageCount: 24,
      specialty: 'Emergency Medicine'
    }
  },
  {
    id: 'doc-8',
    userId: 'user-1',
    filename: 'Pneumonia_Treatment_Guidelines.pdf',
    summary: 'Evidence-based guidelines for community-acquired and hospital-acquired pneumonia',
    source: 'community',
    shareStatus: 'public',
    uploadedBy: 'Dr. Garcia',
    uploadedAt: new Date('2024-02-08'),
    s3Url: 'https://s3.example.com/doc-8.pdf',
    tags: ['pneumonia', 'antibiotics', 'respiratory', 'infection'],
    metadata: {
      pageCount: 38,
      specialty: 'Infectious Disease'
    }
  }
];

// Get all documents for the current user
export async function getAllDocuments(userId?: string): Promise<Document[]> {
  // In a real app, this would filter by userId and include public documents
  // For now, return all documents
  await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
  return mockDocuments;
}

// Search documents by query
export async function searchDocuments(query: string, userId?: string): Promise<DocumentSearchResult[]> {
  await new Promise(resolve => setTimeout(resolve, 100)); // Simulate network delay
  
  if (!query.trim()) {
    return [];
  }
  
  const lowerQuery = query.toLowerCase();
  
  // Simple search implementation - in production would use vector search
  const results = mockDocuments
    .filter(doc => {
      const searchableText = [
        doc.filename,
        doc.summary,
        ...doc.tags,
        doc.uploadedBy
      ].join(' ').toLowerCase();
      
      return searchableText.includes(lowerQuery);
    })
    .map(doc => {
      // Calculate a simple relevance score
      let score = 0;
      if (doc.filename.toLowerCase().includes(lowerQuery)) score += 3;
      if (doc.summary.toLowerCase().includes(lowerQuery)) score += 2;
      if (doc.tags.some(tag => tag.toLowerCase().includes(lowerQuery))) score += 1;
      
      return {
        document: doc,
        relevanceScore: score,
        matchedText: doc.summary.substring(0, 100) + '...'
      };
    })
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, 10); // Limit to top 10 results
  
  return results;
}

// Get documents by IDs
export async function getDocumentsByIds(ids: string[]): Promise<Document[]> {
  await new Promise(resolve => setTimeout(resolve, 200)); // Simulate network delay
  return mockDocuments.filter(doc => ids.includes(doc.id));
}

// Get a single document by ID
export async function getDocumentById(id: string): Promise<Document | null> {
  await new Promise(resolve => setTimeout(resolve, 100)); // Simulate network delay
  return mockDocuments.find(doc => doc.id === id) || null;
} 