import { defineConfig } from 'prisma/config';

// Deployment/migration credentials are for operator/CI only, never web requests.
export default defineConfig({
  schema: 'contracts/schema.prisma',
  migrations: { path: 'prisma/migrations' },
  datasource: { url: process.env.DIRECT_DATABASE_URL ?? '' },
});
