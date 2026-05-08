/// <reference types="vite/client" />

// No VITE_ prefixed secrets — OpenAI key stays server-side only.
// See server.js and docs/openai-forge.md.

interface ImportMetaEnv {
  readonly MODE: string
  readonly BASE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
