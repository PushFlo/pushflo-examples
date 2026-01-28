/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PUSHFLO_PUBLISH_KEY: string
  readonly VITE_PUSHFLO_BASE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
