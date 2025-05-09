import { getVectorStore } from '@/libs/vectorStore';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { OpenAIEmbeddings } from '@langchain/openai';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';

// const loader = new PDFLoader('public/virani-et-al-2023-aha-acc-accp-aspc-nla-pcna-guideline-for-the-management-of-patients-with-chronic-coronary-disease-a.pdf');

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const files = formData.getAll('files') as File[];
    if (!files.length) {
      return new Response(JSON.stringify({ error: 'No files uploaded' }), { status: 400 });
    }

    for (const file of files) {
      // Step 1: Loading
      const loader = new PDFLoader(file);
      const docs = await loader.load();
      console.warn(docs[25]?.pageContent.slice(0, 6000));
      console.warn(docs[25]?.metadata);
      // Step 2: Splitting
      // Each chunk should be a semantic part of the document
      // The most optimal chunk is one that divides the content into semantic parts with the least amount of "impurities" or noise. This means that each chunk should ideally contain text that relates to a single topic, concept, or idea.
      // Recursive Chunking is a technique that divides the input text into smaller chunks in a hierarchical and iterative manner using separators. The method calls itself recursively with a different separator e.g. "\n\n" or "\n" or " " etc. So chunks aren't the same but close.
      const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1024,
        chunkOverlap: 200,
      });
      const allSplits = await textSplitter.splitDocuments(docs);
      console.warn(allSplits.length);
      // Step 3: Embedding
      // Embedding documents are slightly different word embeddings in that the entire chunk is converted into a single vector which is supposed to be a rich representation of the chunk's semantic meaning.
      const embeddings = new OpenAIEmbeddings({
        model: 'text-embedding-3-large',
      });

      const vector1 = await embeddings.embedQuery(allSplits[0]!.pageContent);
      console.warn(`Generated vectors of length ${vector1.length}`);

      // Step 4: Vector Store
      // This essentially takes all the chunk + metadata in allSplits and creates an embedding for each chunk and stores it in the Supabase vector store below. match_documents is a Function defined in supabase that performs similarity search.
      const vectorStore = await getVectorStore();
      await vectorStore.addDocuments(allSplits);
    }

    return new Response(JSON.stringify({ length: files.length }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), { status: 500 });
  }
}
