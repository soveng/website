/// <reference types="astro/client" />

interface ImportMetaEnv {
  /**
   * Fathom site ID, used by astro-fathom.
   * Example: "ABCDEFGH"
   */
  readonly FATHOM_SITE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}


