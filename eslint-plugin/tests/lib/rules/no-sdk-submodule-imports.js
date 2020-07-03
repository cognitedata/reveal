const { RuleTester } = require('eslint');
const rule = require('../../../lib/rules/no-sdk-submodule-imports');

const parserOptions = {
  ecmaVersion: 2018,
  sourceType: 'module',
  ecmaFeatures: { jsx: true },
};

const ruleTester = new RuleTester({ parserOptions });

ruleTester.run('no-sdk-submodule-imports', rule, {
  valid: [
    { code: "import { TimeSeriesClass as TimeSeries } from '@cognite/sdk';" },
    { code: "import { useMetrics } from '@cognite/metrics';" },
    { code: "import { Button } from 'antd';" },
  ],
  invalid: [
    {
      code:
        "import { TimeSeries } from '@cognite/sdk/dist/src/resources/classes/timeSeries';",
      errors: [{ messageId: 'no-sdk-submodule-imports' }],
    },
  ],
});
