import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.{test,spec}.{js,mjs}'],
    globals: true,
    environment: 'node',
  },
  resolve: {
    alias: {
      '@js': new URL('./skillhub/assets/js', import.meta.url).pathname,
    },
  },
});
