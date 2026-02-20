import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    setupNodeEvents(on, config) {},
    env: {
      apiUrl: 'http://localhost:8000/api',
      testUser: process.env.CYPRESS_TEST_USER || 'testuser',
      testPassword: process.env.CYPRESS_TEST_PASSWORD || 'testpass',
      companySlug: 'riverside-herald',
    },
  },
});
