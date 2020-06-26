module.exports = {
    preset: 'jest-puppeteer',
    testRegex: './*\\.test\\.ts$',
    transform: {
        "^.+\\.(ts|tsx)$": "ts-jest"
    },
    setupFilesAfterEnv: ['./setupTests.ts'],
    globalSetup: "jest-environment-puppeteer/setup",
    globalTeardown: "jest-environment-puppeteer/teardown",
    testEnvironment: "jest-environment-puppeteer"
};