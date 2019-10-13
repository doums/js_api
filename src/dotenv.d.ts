declare namespace NodeJS {
  export interface ProcessEnv {
    PRISMA_SECRET: string;
    PRISMA_ENDPOINT: string;
    API_SECRET: string;
  }
}