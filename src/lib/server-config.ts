import "server-only";

export const serverConfig = {
  mode: process.env.APP_MODE ?? "local",
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  databaseUrl: process.env.DATABASE_URL,
  github: {
    appId: process.env.GITHUB_APP_ID,
    clientId: process.env.GITHUB_APP_CLIENT_ID,
    clientSecret: process.env.GITHUB_APP_CLIENT_SECRET,
    privateKeyBase64: process.env.GITHUB_APP_PRIVATE_KEY_BASE64,
    webhookSecret: process.env.GITHUB_APP_WEBHOOK_SECRET,
    publicToken: process.env.GITHUB_PUBLIC_TOKEN,
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL ?? "gpt-5.6",
    dailyOrgTokenLimit: Number(process.env.OPENAI_DAILY_ORG_TOKEN_LIMIT ?? "250000"),
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  },
  resend: {
    apiKey: process.env.RESEND_API_KEY,
    from: process.env.EMAIL_FROM ?? "reports@repoproof.local",
  },
  reports: {
    signingSecret: process.env.REPORT_SIGNING_SECRET ?? "mock-report-signing-secret",
  },
};

export function isMockMode() {
  return serverConfig.mode === "mock" || serverConfig.mode === "demo";
}
