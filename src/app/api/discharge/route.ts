import { StringOutputParser } from '@langchain/core/output_parsers';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';

export const dynamic = 'force-dynamic';

const systemTemplate = 'Write a discharge letter for the following context:';
const prompt = ChatPromptTemplate.fromMessages([
  ['system', systemTemplate],
  ['user', '{context}'],
]);
export async function POST(req: Request) {
  try {
    const { context } = await req.json();
    // const model = new ChatOpenAI({ model: 'gpt-4' });
    const model = new ChatGoogleGenerativeAI({ model: 'gemini-1.5-flash' });
    const parser = new StringOutputParser();
    const chain = prompt.pipe(model).pipe(parser);

    const message = await chain.invoke({ context });
    return new Response(message, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error(error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
