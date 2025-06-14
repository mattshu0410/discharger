import { SupabaseVectorStore } from '@langchain/community/vectorstores/supabase';
import { OpenAIEmbeddings } from '@langchain/openai';
import { createServerSupabaseClient } from '@/libs/supabase-server';

export async function getVectorStore(userId?: string) {
  const supabaseClient = createServerSupabaseClient();
  const embeddings = new OpenAIEmbeddings({
    model: 'text-embedding-3-large',
  });

  return new SupabaseVectorStore(embeddings, {
    client: supabaseClient,
    tableName: 'document_vecs',
    queryName: 'match_documents',
    filter: userId ? { user_id: userId } : undefined,
  });
}

export async function getUserVectorStore(userId: string) {
  return getVectorStore(userId);
}
