import { GoogleGenAI } from '@google/genai';
import { getMappingPrompt } from '../prompts/mapping.prompt';
import { AiMappingResponseSchema, CrmRecord } from '../validators/crm.schema';
import logger from '../utils/logger';
import PQueue from 'p-queue';

let ai: GoogleGenAI;
const getAiClient = () => {
  if (!ai) {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY || '',
    });
  }
  return ai;
};

const queue = new PQueue({ concurrency: 3 });

function fallbackMapRecords(batch: any[]): CrmRecord[] {
  return batch.map(row => {
    const normalizedRow: any = {};
    for (const key in row) {
      if (typeof key === 'string') {
        normalizedRow[key.toLowerCase().trim()] = row[key];
      }
    }
    
    let name = '';
    let email = '';
    let phone = '';
    let company = '';
    let city = '';
    let state = '';
    let country = '';
    let crm_status = '';
    let data_source = '';
    let crm_note = '';

    for (const key in normalizedRow) {
      const val = normalizedRow[key];
      if (!val) continue;
      
      if (!name && (key.includes('name'))) name = val;
      if (!email && (key.includes('email') || key.includes('mail') || (key.includes('contact info') && val.includes('@')))) email = val;
      if (!phone && (key.includes('phone') || key.includes('mobile') || key.includes('contact'))) {
         // if we matched contact info above for email, make sure we only match digits here
         if (!val.includes('@')) phone = val;
      }
      if (!company && (key.includes('company') || key.includes('organization'))) company = val;
      if (!city && (key.includes('city') || key.includes('location'))) city = val;
      if (!state && (key.includes('state') || key.includes('province'))) state = val;
      if (!country && (key.includes('country'))) country = val;
      if (!crm_status && (key.includes('status'))) crm_status = val;
      if (!data_source && (key.includes('campaign') || key.includes('source'))) data_source = val;
      if (!crm_note && (key.includes('comment') || key.includes('note') || key.includes('description'))) crm_note = val;
    }

    return {
      ...row,
      name,
      email,
      mobile_without_country_code: phone,
      company,
      city,
      state,
      country,
      crm_status,
      data_source,
      crm_note
    } as any as CrmRecord;
  });
}

let aiFailedCompletely = false;

async function processBatchWithRetry(
  batch: any[],
  retries = 3
): Promise<CrmRecord[]> {
  if (aiFailedCompletely) {
    return fallbackMapRecords(batch);
  }

  const prompt = getMappingPrompt();
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      logger.info(`Processing batch of ${batch.length} records. Attempt ${attempt}`);
      
      const response = await getAiClient().models.generateContent({
        model: 'gemini-2.0-flash',
        contents: [
          { role: 'user', parts: [{ text: prompt }] },
          { role: 'user', parts: [{ text: JSON.stringify(batch) }] }
        ],
        config: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        }
      });

      const responseText = response.text || '{}';
      
      // Attempt to parse JSON
      const parsedJson = JSON.parse(responseText);
      
      // Validate with Zod
      const validatedData = AiMappingResponseSchema.parse(parsedJson);
      
      // Sanitize fields: escape line breaks to ensure CSV compatibility downstream
      const sanitizedRecords = validatedData.records.map(record => {
        const sanitized: any = {};
        for (const [key, value] of Object.entries(record)) {
          if (typeof value === 'string') {
            sanitized[key] = value.replace(/\r?\n/g, '\\n');
          } else {
            sanitized[key] = value;
          }
        }
        return sanitized as CrmRecord;
      });
      
      return sanitizedRecords;

    } catch (error: any) {
      logger.error(`Error processing batch (Attempt ${attempt}): ${error.message}`);
      // Immediately fail and use fallback if it's a 403 (Forbidden), 429 (Quota Exceeded), or max retries
      if (
        attempt === retries || 
        error.status === 403 || 
        error.message.includes('403') || 
        error.message.includes('PERMISSION_DENIED') ||
        error.status === 429 ||
        error.message.includes('429') ||
        error.message.includes('RESOURCE_EXHAUSTED') ||
        error.message.includes('Quota exceeded')
      ) {
        logger.warn('AI processing failed completely (invalid key, quota exceeded, or max retries). Falling back to basic manual mapping for all future batches.');
        aiFailedCompletely = true;
        return fallbackMapRecords(batch);
      }
      // Exponential backoff
      await new Promise(res => setTimeout(res, attempt * 1000));
    }
  }
  return fallbackMapRecords(batch);
}

export async function processAllRecords(records: any[]): Promise<{
  parsedRecords: CrmRecord[],
  skippedRecords: any[]
}> {
  const BATCH_SIZE = 25;
  const parsedRecords: CrmRecord[] = [];
  const skippedRecords: any[] = [];
  
  const batches = [];
  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    batches.push(records.slice(i, i + BATCH_SIZE));
  }

  logger.info(`Total records: ${records.length}. Split into ${batches.length} batches.`);

  const results = await Promise.all(
    batches.map(batch => queue.add(() => processBatchWithRetry(batch)))
  );

  // Flatten the results
  results.forEach(batchResult => {
    if (batchResult) {
      parsedRecords.push(...batchResult);
    }
  });

  // Calculate skipped records (records that went in but didn't come out because they lacked email/phone)
  // Wait, mapping prompt drops records without email/phone.
  // To identify exactly which ones were dropped, we might need an ID mapping, but for now
  // we can simply count the difference if we assume no extra records were created.
  // Since the user wants a skipped records list, let's filter them before sending to AI, or match them.
  // Actually, filtering before sending to AI saves tokens and makes mapping skipped records exact.

  return {
    parsedRecords,
    skippedRecords // we will implement the pre-filtering in the controller or a wrapper
  };
}
