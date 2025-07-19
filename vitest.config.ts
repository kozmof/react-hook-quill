import { coverageConfigDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './vitest.setup.ts',
    testTimeout: 7000,
    coverage: {
      exclude: [
        './src/index.ts',
        ...coverageConfigDefaults.exclude
      ]
    }
  }
});
