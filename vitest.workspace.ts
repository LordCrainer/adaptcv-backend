import { defineWorkspace } from 'vitest/config'

export default defineWorkspace([
  {
    extends: './vite.config.ts',
    test: {
      name: 'unit',
      include: ['./src/tests/unit/**/*.test.ts']
    }
  },
  {
    extends: './vite.config.ts',
    test: {
      name: 'integration',
      include: ['./src/tests/integration/**/*.test.ts'],
      setupFiles: ['./src/tests/integration/setup-int.ts']
    }
  },
  {
    extends: './vite.config.ts',
    test: {
      name: 'e2e',
      include: ['./src/tests/e2e/**/*.spec.ts'],
      setupFiles: ['./src/tests/e2e/setup-e2e.ts']
    }
  }
])
