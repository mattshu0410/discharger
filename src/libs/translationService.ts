import type { SupportedLocale } from '@/api/patient-summaries/types';
import type { Block } from '@/types/blocks';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { createTranslationSchema, getBlockTypesFromBlocks } from '@/libs/blockSchemas';
import { logger } from '@/libs/Logger';

// Language mapping for natural language instructions
const LANGUAGE_MAP: Record<SupportedLocale, string> = {
  en: 'English',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  it: 'Italian',
  pt: 'Portuguese',
  zh: 'Chinese (Simplified)',
  ja: 'Japanese',
  ko: 'Korean',
  ar: 'Arabic',
};

const systemPrompt = `You are a medical translation AI that translates patient discharge summary blocks while preserving all medical accuracy and structure.

Your task is to translate patient-friendly medical content from one language to another while:

1. Maintaining medical accuracy and precision
2. Preserving all dosages, frequencies, and medical instructions exactly
3. Keeping the same data structure and field organization
4. Using culturally appropriate language for the target locale
5. Ensuring all medical terms are clearly explained in the target language
6. Preserving all dates, times, and numerical values
7. Maintaining the same level of patient-friendly language

CRITICAL PRESERVATION RULES:
- NEVER change: IDs, type values, metadata (createdAt, updatedAt, version), isEditable, isRequired flags
- NEVER change: Medication dosages, frequencies, status values, appointment statuses
- NEVER change: Task completion status, priority levels, due dates, completion flags
- NEVER change: Any boolean, enum, or date values
- PRESERVE EXACTLY: All structural and technical fields including block type values

TRANSLATION SCOPE:
- DO translate: Block titles, medication names (with original in parentheses), task titles/descriptions
- DO translate: Symptom descriptions, appointment descriptions, clinic names, instructions
- DO translate: All user-facing text content that helps patient understanding

OUTPUT REQUIREMENTS:
- Return the exact same JSON structure as input
- All blocks must maintain their complete metadata and structural integrity
- Ensure every field from input appears in output with correct data types`;

const createUserPrompt = (targetLanguage: string, sourceLanguage: string = 'English') => {
  return `Translate these complete medical discharge summary blocks from ${sourceLanguage} to ${targetLanguage}.

Each block contains full metadata and structure that must be preserved exactly:

Input blocks:
{blocks}

TRANSLATION REQUIREMENTS:
1. Translate ONLY user-facing text: titles, descriptions, instructions, names
2. PRESERVE EXACTLY: All IDs, type values, metadata, flags, enums, dates, booleans, numbers
3. Maintain medical accuracy - dosages, frequencies, and medical data unchanged
4. Use patient-friendly language appropriate for ${targetLanguage} speakers
5. For medication names, include original in parentheses: "Translated Name (Original Name)"
6. Return blocks in identical structure with all original fields present including exact type values

The output must pass strict schema validation - every field must be preserved with correct data types.`;
};

export class TranslationService {
  private model: ChatGoogleGenerativeAI;

  constructor() {
    this.model = new ChatGoogleGenerativeAI({
      model: 'gemini-2.0-flash',
      temperature: 0.1, // Low temperature for consistent, accurate translations
    });
  }

  async translateBlocks(
    blocks: Block[],
    targetLocale: SupportedLocale,
    sourceLocale: SupportedLocale = 'en',
  ): Promise<Block[]> {
    try {
      const targetLanguage = LANGUAGE_MAP[targetLocale];
      const sourceLanguage = LANGUAGE_MAP[sourceLocale];

      if (!targetLanguage) {
        throw new Error(`Unsupported target locale: ${targetLocale}`);
      }

      // Get block types from the input blocks for schema validation
      const blockTypes = getBlockTypesFromBlocks(blocks);
      if (blockTypes.length === 0) {
        throw new Error('No supported block types found in input blocks');
      }

      // Create schema based on the actual block types present
      const translationSchema = createTranslationSchema(blockTypes);

      // Create structured output model with strict schema validation
      const structuredModel = this.model.withStructuredOutput(translationSchema, {
        name: 'medical_translation',
      });

      const prompt = ChatPromptTemplate.fromMessages([
        ['system', systemPrompt],
        ['user', createUserPrompt(targetLanguage, sourceLanguage)],
      ]);

      const chain = prompt.pipe(structuredModel);

      const response = await chain.invoke({
        blocks: JSON.stringify(blocks, null, 2),
      });

      // Validate that the structure matches and return translated blocks
      const translatedBlocks = response.translated_blocks.map(block => ({
        ...block,
        metadata: {
          ...block.metadata,
          createdAt: typeof block.metadata.createdAt === 'string'
            ? new Date(block.metadata.createdAt)
            : block.metadata.createdAt,
          updatedAt: new Date(),
        },
      })) as Block[];

      logger.info('Successfully translated blocks:', translatedBlocks.length);
      return translatedBlocks;
    } catch (error) {
      logger.error('Translation error:', error);
      throw new Error(`Failed to translate blocks: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Translate a single block (useful for individual block updates)
   */
  async translateBlock(
    block: Block,
    targetLocale: SupportedLocale,
    sourceLocale: SupportedLocale = 'en',
  ): Promise<Block> {
    const translatedBlocks = await this.translateBlocks([block], targetLocale, sourceLocale);
    return translatedBlocks[0] as Block;
  }

  /**
   * Get supported languages
   */
  getSupportedLocales(): SupportedLocale[] {
    return Object.keys(LANGUAGE_MAP) as SupportedLocale[];
  }

  /**
   * Get language name for a locale
   */
  getLanguageName(locale: SupportedLocale): string {
    return LANGUAGE_MAP[locale] || locale;
  }

  /**
   * Validate if a locale is supported
   */
  isLocaleSupported(locale: string): locale is SupportedLocale {
    return locale in LANGUAGE_MAP;
  }
}

// Export a singleton instance
export const translationService = new TranslationService();
