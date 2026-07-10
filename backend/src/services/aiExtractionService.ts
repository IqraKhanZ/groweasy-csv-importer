import OpenAI from 'openai';
import { CrmRecord, AiExtractionError } from '../types/crmRecord';
import { buildSystemPrompt, buildUserPrompt } from '../prompts/crmExtractionPrompt';

// =============================================================================
// Types
// =============================================================================

export type AiProvider = 'openai' | 'gemini' | 'claude' | 'huggingface' | 'openrouter' | 'groq';

// =============================================================================
// Response parser
// =============================================================================

/**
 * Strips markdown fences (```json ... ``` or ``` ... ```) from an AI response
 * and parses the result as JSON. Returns the parsed array.
 *
 * @throws AiExtractionError if the result cannot be parsed or is not an array
 */
export function parseAiJsonResponse(raw: string): unknown[] {
  // Strip leading/trailing whitespace
  let cleaned = raw.trim();

  // Remove markdown code fences: ```json\n...\n``` or ```\n...\n```
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '');

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch (err) {
    throw new AiExtractionError(
      `Failed to parse AI response as JSON: ${(err as Error).message}`,
    );
  }

  if (!Array.isArray(parsed)) {
    throw new AiExtractionError(
      'AI response is not a JSON array.',
    );
  }

  return parsed;
}

// =============================================================================
// Provider implementations
// =============================================================================

async function callOpenAi(
  batch: Record<string, string>[],
  model: string,
  apiKey: string,
): Promise<unknown[]> {
  const client = new OpenAI({ apiKey });

  const response = await client.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: buildSystemPrompt() },
      { role: 'user', content: buildUserPrompt(batch) },
    ],
    temperature: 0,
  });

  const raw = response.choices[0]?.message?.content ?? '';
  return parseAiJsonResponse(raw);
}

async function callOpenRouter(
  batch: Record<string, string>[],
  model: string,
  apiKey: string,
): Promise<unknown[]> {
  const client = new OpenAI({
    apiKey,
    baseURL: 'https://openrouter.ai/api/v1',
    defaultHeaders: {
      'HTTP-Referer': 'https://github.com/groweasy',
      'X-Title': 'GrowEasy CSV Importer',
    }
  });

  const response = await client.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: buildSystemPrompt() },
      { role: 'user', content: buildUserPrompt(batch) },
    ],
    temperature: 0,
  });

  const raw = response.choices[0]?.message?.content ?? '';
  return parseAiJsonResponse(raw);
}

async function callGroq(
  batch: Record<string, string>[],
  model: string,
  apiKey: string,
): Promise<unknown[]> {
  const client = new OpenAI({
    apiKey,
    baseURL: 'https://api.groq.com/openai/v1',
  });

  const response = await client.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: buildSystemPrompt() },
      { role: 'user', content: buildUserPrompt(batch) },
    ],
    temperature: 0,
  });

  const raw = response.choices[0]?.message?.content ?? '';
  return parseAiJsonResponse(raw);
}

async function callGemini(
  batch: Record<string, string>[],
  model: string,
  apiKey: string,
): Promise<unknown[]> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const systemPrompt = buildSystemPrompt();
  const userPrompt = buildUserPrompt(batch);

  const body = {
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: `${systemPrompt}\n\n${userPrompt}`,
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0,
    },
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new AiExtractionError(`Gemini API error (${res.status}): ${errText}`);
  }

  const data = (await res.json()) as {
    candidates?: Array<{
      content?: { parts?: Array<{ text?: string }> };
    }>;
  };

  const raw = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  return parseAiJsonResponse(raw);
}

async function callClaude(
  batch: Record<string, string>[],
  model: string,
  apiKey: string,
): Promise<unknown[]> {
  const url = 'https://api.anthropic.com/v1/messages';

  const body = {
    model,
    max_tokens: 8192,
    system: buildSystemPrompt(),
    messages: [
      { role: 'user', content: buildUserPrompt(batch) },
    ],
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new AiExtractionError(`Claude API error (${res.status}): ${errText}`);
  }

  const data = (await res.json()) as {
    content?: Array<{ type: string; text?: string }>;
  };

  const raw =
    data.content?.find((block) => block.type === 'text')?.text ?? '';
  return parseAiJsonResponse(raw);
}

async function callHuggingFace(
  batch: Record<string, string>[],
  model: string,
  apiKey: string,
): Promise<unknown[]> {
  const url = `https://api-inference.huggingface.co/models/${model}`;
  const systemPrompt = buildSystemPrompt();
  const userPrompt = buildUserPrompt(batch);

  // We format the instruction using the standard ChatML or Llama/Mistral instruction template:
  // <s>[INST] system_prompt\n\nuser_prompt [/INST]
  const prompt = `<s>[INST] ${systemPrompt}\n\n${userPrompt} [/INST]`;

  const body = {
    inputs: prompt,
    parameters: {
      max_new_tokens: 4096,
      temperature: 0.1,
      return_full_text: false
    }
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new AiExtractionError(`Hugging Face API error (${res.status}): ${errText}`);
  }

  const data = (await res.json()) as Array<{ generated_text?: string }> | { generated_text?: string };
  let raw = '';
  if (Array.isArray(data)) {
    raw = data[0]?.generated_text ?? '';
  } else if (data && typeof data === 'object') {
    raw = data.generated_text ?? '';
  }

  return parseAiJsonResponse(raw);
}

// =============================================================================
// Public API
// =============================================================================

/**
 * Sends a batch of CSV row objects to the configured AI provider and returns
 * the AI-extracted partial CRM records.
 *
 * @throws AiExtractionError if:
 *   - AI_API_KEY is missing
 *   - The AI provider is unsupported
 *   - The response cannot be parsed as a valid JSON array
 *   - The response array length does not match the batch length
 */
export async function extractBatch(
  batch: Record<string, string>[],
): Promise<Partial<CrmRecord>[]> {
  const provider = (process.env['AI_PROVIDER'] ?? 'openai') as AiProvider;
  const model = process.env['AI_MODEL'] ?? 'gpt-4o-mini';
  const apiKey = process.env['AI_API_KEY'] ?? '';

  if (!apiKey) {
    throw new AiExtractionError('AI_API_KEY environment variable is not set.');
  }

  let parsed: unknown[];

  switch (provider) {
    case 'openai':
      parsed = await callOpenAi(batch, model, apiKey);
      break;
    case 'gemini':
      parsed = await callGemini(batch, model, apiKey);
      break;
    case 'claude':
      parsed = await callClaude(batch, model, apiKey);
      break;
    case 'huggingface':
      parsed = await callHuggingFace(batch, model, apiKey);
      break;
    case 'openrouter':
      parsed = await callOpenRouter(batch, model, apiKey);
      break;
    case 'groq':
      parsed = await callGroq(batch, model, apiKey);
      break;
    default:
      throw new AiExtractionError(`Unsupported AI provider: ${provider as string}`);
  }

  if (parsed.length !== batch.length) {
    throw new AiExtractionError(
      `AI returned ${parsed.length} records for a batch of ${batch.length}. Length mismatch.`,
    );
  }

  return parsed as Partial<CrmRecord>[];
}
