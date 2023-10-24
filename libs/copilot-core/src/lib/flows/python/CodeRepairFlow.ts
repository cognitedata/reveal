import { RepairPython } from '@cognite/llm-hub';
import { CogniteClient } from '@cognite/sdk/dist/src';

import { Flow } from '../../CogniteBaseFlow';
import { CopilotBotTextResponse, CopilotCodeResponse } from '../../types';

type Fields = { code: string; errorMessage: string; sdk: CogniteClient };

export class CodeRepairFlow extends Flow<
  Fields,
  CopilotBotTextResponse | CopilotCodeResponse
> {
  label = 'Repair code';
  description = 'Fixes the code based on the error message';

  run: Flow<Fields, CopilotBotTextResponse | CopilotCodeResponse>['run'] =
    async ({ code, sdk, errorMessage }) => {
      const {
        result: { CodeRepair, Suggestion },
      } = await RepairPython.run({
        client_code: code,
        error_message: errorMessage,
        sdk,
        model: 'gpt-4',
        message: '',
      });

      if (CodeRepair) {
        return {
          code: CodeRepair,
          language: 'python',
          content: "Here's a suggested fit to the code",
          type: 'code',
        };
      }

      return {
        content: Suggestion,
        type: 'text',
      };
    };
}
