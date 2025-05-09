import { supabaseClient } from '@/libs/supabaseClient';
import { SupabaseVectorStore } from '@langchain/community/vectorstores/supabase';
import { OpenAIEmbeddings } from '@langchain/openai';

export async function getVectorStore() {
  const embeddings = new OpenAIEmbeddings({
    model: 'text-embedding-3-large',
  });

  return new SupabaseVectorStore(embeddings, {
    client: supabaseClient,
    tableName: 'documents',
    queryName: 'match_documents',
  });
}
