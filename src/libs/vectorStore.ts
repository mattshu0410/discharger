import { createServerSupabaseClient } from '@/libs/supabaseClient';
import { SupabaseVectorStore } from '@langchain/community/vectorstores/supabase';
import { OpenAIEmbeddings } from '@langchain/openai';

export async function getVectorStore() {
  const supabaseClient = createServerSupabaseClient();
  const embeddings = new OpenAIEmbeddings({
    model: 'text-embedding-3-large',
  });

  return new SupabaseVectorStore(embeddings, {
    client: supabaseClient,
    tableName: 'document_vecs',
    queryName: 'match_documents',
  });
}
