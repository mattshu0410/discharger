import { getVectorStore } from '@/libs/vectorStore';
import { DocxLoader } from '@langchain/community/document_loaders/fs/docx';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { OpenAIEmbeddings } from '@langchain/openai';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';

// const loader = new PDFLoader('public/virani-et-al-2023-aha-acc-accp-aspc-nla-pcna-guideline-for-the-management-of-patients-with-chronic-coronary-disease-a.pdf');

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const startTotal = Date.now();
    const formData = await req.formData();
    const files = formData.getAll('files') as File[];
    if (!files.length) {
      return new Response(JSON.stringify({ error: 'No files uploaded' }), { status: 400 });
    }

    for (const file of files) {
      const startLoad = Date.now();
      // Step 1: Loading - Create appropriate loader based on file type
      const fileExtension = file.name.toLowerCase().split('.').pop();
      let loader;

      switch (fileExtension) {
        case 'pdf':
          loader = new PDFLoader(file);
          break;
        case 'docx':
          loader = new DocxLoader(file);
          break;
        case 'doc':
          // Note: .doc files may require additional processing or conversion
          // For now, try DocxLoader which might handle some .doc files
          loader = new DocxLoader(file);
          break;
        default:
          throw new Error(`Unsupported file type: ${fileExtension}`);
      }

      const docs = await loader.load();
      const endLoad = Date.now();
      console.warn(`Document loading took ${endLoad - startLoad} ms`);
      console.warn(docs[25]?.pageContent.slice(0, 6000));
      console.warn(docs[25]?.metadata);

      const startSplit = Date.now();
      // Step 2: Splitting
      // Each chunk should be a semantic part of the document
      // The most optimal chunk is one that divides the content into semantic parts with the least amount of "impurities" or noise. This means that each chunk should ideally contain text that relates to a single topic, concept, or idea.
      // Recursive Chunking is a technique that divides the input text into smaller chunks in a hierarchical and iterative manner using separators. The method calls itself recursively with a different separator e.g. "\n\n" or "\n" or " " etc. So chunks aren't the same but close.
      const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1024,
        chunkOverlap: 200,
      });
      const allSplits = await textSplitter.splitDocuments(docs);
      const endSplit = Date.now();
      console.warn(`Splitting took ${endSplit - startSplit} ms`);
      console.warn(allSplits.length);

      const startEmbed = Date.now();
      // Step 3: Embedding
      // Embedding documents are slightly different word embeddings in that the entire chunk is converted into a single vector which is supposed to be a rich representation of the chunk's semantic meaning.
      const embeddings = new OpenAIEmbeddings({
        model: 'text-embedding-3-large',
      });

      const vector1 = await embeddings.embedQuery(allSplits[0]!.pageContent);
      const endEmbed = Date.now();
      console.warn(`Embedding (first chunk) took ${endEmbed - startEmbed} ms`);
      console.warn(`Generated vectors of length ${vector1.length}`);

      const startVectorStore = Date.now();
      // Step 4: Vector Store
      // This essentially takes all the chunk + metadata in allSplits and creates an embedding for each chunk and stores it in the Supabase vector store below. match_documents is a Function defined in supabase that performs similarity search.
      const vectorStore = await getVectorStore();
      await vectorStore.addDocuments(allSplits);
      const endVectorStore = Date.now();
      console.warn(`Vector store addDocuments took ${endVectorStore - startVectorStore} ms`);
    }

    const endTotal = Date.now();
    console.warn(`Total POST processing took ${endTotal - startTotal} ms`);
    return new Response(JSON.stringify({ length: files.length }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), { status: 500 });
  }
}
