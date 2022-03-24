const { getJestProjects } = require('@nrwl/jest');

module.exports = {
  projects: getJestProjects(),
  reporters: [
    'default',
        [
            'jest-junit',
            {
                outputDirectory: '<rootDir>',
                outputName: 'test-report.xml',
                suiteName: 'Jest tests',
                classNameTemplate: '{classname} / {title}',
                titleTemplate: '{classname} / {title}',
                ancestorSeparator: ' / ',
                usePathForSuiteName: 'true',
                includeConsoleOutput: 'true',
            },
        ],
  ],
};
