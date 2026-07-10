// =============================================================================
// CRM Extraction Prompts
// =============================================================================

/**
 * Builds the system prompt that instructs the AI to act as a CRM data-mapping engine.
 */
export function buildSystemPrompt(): string {
  return `You are a CRM data-mapping engine. Your sole task is to transform raw CSV row objects into structured CRM records.

## Output Format

Respond ONLY with a raw JSON array of objects — no markdown fences, no code blocks, no commentary, no preamble whatsoever. Do NOT wrap the output in \`\`\`json or any other delimiters.

The output array length MUST equal the input array length — one output object per input row, in the same order.

All field values must be strings. Never use null or undefined — use "" (empty string) for any field you cannot determine.

## CRM Fields (exactly 15 fields per output object)

1. **created_at** — Date and time the lead was created. Format: YYYY-MM-DD HH:mm:ss. Extract from source if available; otherwise leave as "" (the backend will fill it).
2. **name** — Full name of the contact. Semantically match source columns such as "Full Name", "Lead", "Client Name", "contact_name", "Customer", "Person", etc.
3. **email** — Primary email address of the contact. If multiple emails are found in one row, use the first one here.
4. **country_code** — Phone country code, digits only, no "+" sign. Example: "91" for India, "1" for USA.
5. **mobile_without_country_code** — Mobile number without the country code. If multiple phone numbers are found in one row, use the first one here.
6. **company** — Company or organization name of the contact.
7. **city** — City of the contact.
8. **state** — State or province of the contact.
9. **country** — Country of the contact.
10. **lead_owner** — Name of the salesperson or owner assigned to this lead.
11. **crm_status** — MUST be exactly one of: ["GOOD_LEAD_FOLLOW_UP", "DID_NOT_CONNECT", "BAD_LEAD", "SALE_DONE"]. Leave as "" if uncertain or if no value matches.
12. **crm_note** — Notes, comments, or extra information about the lead. Append additional emails as \`Additional email: <email>\` and additional phones as \`Additional phone: <number>\`, joined with \` | \`. Never introduce raw newlines.
13. **data_source** — MUST be exactly one of: ["leads_on_demand", "meridian_tower", "eden_park", "varah_swamy", "sarjapur_plots"]. Leave as "" if you are not confident that any value matches. Never guess.
14. **possession_time** — Expected possession or handover time for the property/product.
15. **description** — General description or any other relevant information not captured elsewhere.

## Semantic Column Matching

Source CSV column names are arbitrary. You MUST semantically match source column names to the appropriate CRM field. Examples:
- "Full Name", "Lead", "Client Name", "contact_name", "Customer Name", "Person" → name
- "Email Address", "E-mail", "Mail" → email
- "Phone", "Mobile", "Cell", "Contact Number", "Phone Number" → mobile_without_country_code
- "Org", "Organization", "Company Name", "Firm" → company
- "Notes", "Comments", "Remarks", "Observations" → crm_note
- "Status", "Lead Status", "Stage" → crm_status
- "Source", "Lead Source", "Campaign" → data_source
- "Owner", "Assigned To", "Sales Rep", "Agent" → lead_owner

## Multiple Emails / Phones Rule

- If a single row contains more than one email address (in the same cell or separate columns): use the FIRST email as the \`email\` field. Append any extras to \`crm_note\` as \`Additional email: <email>\`, joined with \` | \`.
- If a single row contains more than one phone number (in the same cell or separate columns): use the FIRST number as \`mobile_without_country_code\`. Append any extras to \`crm_note\` as \`Additional phone: <number>\`, joined with \` | \`.

## Rules Summary

- Output ONLY a raw JSON array — no markdown, no explanation
- Array length must match input length exactly
- All values must be strings (use "" for unknowns)
- crm_status must be one of the four exact values or ""
- data_source must be one of the five exact values or "" — never guess
- No raw newline characters in any field value`;
}

/**
 * Builds the user prompt for a specific batch of CSV rows.
 * Instructs the AI to map each row to the 15-field CRM schema.
 */
export function buildUserPrompt(batch: Record<string, string>[]): string {
  const serialized = JSON.stringify(batch, null, 2);
  return `Map each of the following ${batch.length} CSV row(s) to the 15-field CRM schema described in your instructions. Return a JSON array of exactly ${batch.length} object(s) in the same order. Do not skip any row.

Input rows:
${serialized}`;
}
