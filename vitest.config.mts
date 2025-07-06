import react from '@vitejs/plugin-react';
import { loadEnv } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    globals: true, // This is needed by @testing-library to be cleaned up after each test
    include: ['src/**/*.test.{js,jsx,ts,tsx}'],
    coverage: {
      include: ['src/**/*'],
      exclude: ['src/**/*.stories.{js,jsx,ts,tsx}', '**/*.d.ts'],
    },
    projects: [
      {
        extends: true, // Inherit root config (plugins, globals, coverage, setupFiles, env)
        test: {
          include: ['src/**/*.test.{js,jsx,ts,tsx}'], // Only include UI-related tests here
          environment: 'jsdom',
          name: 'jsdom',
        },
      },
      {
        test: {
          include: ['tests/api/**/*.test.ts'], // Only include API tests here
          environment: 'node',
          name: 'node-api',
          globals: true,
        },
        plugins: [tsconfigPaths()],
      },
    ],
    setupFiles: ['./vitest-setup.ts'],
    env: loadEnv('', process.cwd(), ''),
  },
});
