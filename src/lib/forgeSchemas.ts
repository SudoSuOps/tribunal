// JSON Schema definitions for OpenAI structured output (response_format: json_schema)
// Each schema wraps artifacts in an array envelope so one call generates N items.

export const EVAL_PROMPT_SCHEMA = {
  name: 'eval_prompts',
  strict: true,
  schema: {
    type: 'object',
    properties: {
      artifacts: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            label: {
              type: 'string',
              description: 'Short descriptive title (e.g. "DSCR Underwriting Completion")',
            },
            system_prompt: {
              type: 'string',
              description: 'System prompt — empty string for base model evals',
            },
            user_prompt: {
              type: 'string',
              description: 'The prompt text. For BASE mode: a partial professional document. For INSTRUCT mode: a question or instruction.',
            },
            expected_signal: {
              type: 'string',
              description: 'What a domain-expert correct continuation looks like — key facts, numbers, or reasoning that should appear',
            },
            failure_modes: {
              type: 'array',
              items: { type: 'string' },
              description: 'What a poor or failing continuation looks like (2-4 items)',
            },
            tags: {
              type: 'array',
              items: { type: 'string' },
              description: 'Taxonomy tags (e.g. ["cap-rate", "NOI", "valuation"])',
            },
          },
          required: ['label', 'system_prompt', 'user_prompt', 'expected_signal', 'failure_modes', 'tags'],
          additionalProperties: false,
        },
      },
    },
    required: ['artifacts'],
    additionalProperties: false,
  },
}

export type EvalPromptPayload = {
  label: string
  system_prompt: string
  user_prompt: string
  expected_signal: string
  failure_modes: string[]
  tags: string[]
}
