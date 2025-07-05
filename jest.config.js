/** @type {import('jest').Config} */
const config = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  // Handle ES modules from node_modules
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  globals: {
    'ts-jest': {
      useESM: true,
      tsconfig: {
        jsx: 'react-jsx',
      },
    },
  },
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      useESM: true,
    }],
  },
  // Transform ES modules from node_modules
  transformIgnorePatterns: [
    'node_modules/(?!(@supabase|supabase|isows|ws|@babel|@testing-library|undici|@vercel|@next))',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  // Handle CSS and other assets
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{ts,tsx}',
    '!src/types/**',
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/src/types/',
    '/src/**/*.stories.{ts,tsx}',
  ],
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{ts,tsx}',
    '<rootDir>/src/**/*.{test,spec}.{ts,tsx}',
  ],
  testTimeout: 10000,
  // Add better error handling
  verbose: true,
  maxWorkers: '50%',
  // Handle dynamic imports and ES modules
  resolver: undefined,
  // Environment variables for testing
  testEnvironmentOptions: {
    url: 'http://localhost:3000',
  },
};

module.exports = config; 