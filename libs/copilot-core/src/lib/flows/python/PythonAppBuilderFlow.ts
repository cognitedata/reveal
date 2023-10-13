import { PythonAppBuilderChain } from '@cognite/llm-hub';
import { CogniteClient } from '@cognite/sdk';

import { Flow } from '../../CogniteBaseFlow';
import { CopilotCodeResponse } from '../../types';

type Fields = { prompt: string; sdk: CogniteClient; prevCode: string };

export class PythonAppBuilderFlow extends Flow<Fields, CopilotCodeResponse> {
  label = 'Build streamlit app';
  description = 'Allow a user to build a Streamlit python app.';

  run: Flow<Fields, CopilotCodeResponse>['run'] = async ({
    prompt,
    sdk,
    prevCode,
  }) => {
    const { code } = await PythonAppBuilderChain.run({ message: prompt, sdk });

    return {
      content: code,
      language: 'python',
      type: 'code',
      prevContent: prevCode,
    };
  };

  chatRun: Flow<Fields, CopilotCodeResponse>['chatRun'] = async (
    sendResponse,
    sendStatus
  ) => {
    if (this.fields?.prompt === undefined) {
      return {
        text: 'Please provide query',
        type: 'text',
        onNext: ({ content }) => {
          this.fields.prompt = content;
        },
      };
    }
    sendStatus({ status: 'Generating Python app...' });
    sendResponse(await this.run(this.fields as Fields));
    this.fields.prompt = undefined;
    return undefined;
  };
}
