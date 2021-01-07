module.exports = {
    preset: 'jest-puppeteer',
    testRegex: './*\\.test\\.ts$',
    transform: {
        "^.+\\.(ts|tsx)$": "ts-jest"
    },
    setupFilesAfterEnv: ['./setupTests.ts'],
    globalSetup: "jest-environment-puppeteer/setup",
    globalTeardown: "jest-environment-puppeteer/teardown",
    testEnvironment: "jest-environment-puppeteer",
    testTimeout: 30 * 1000 // typical test ~5s, so 5*retryTimes should be less than timeout or test will fail during retry
};
