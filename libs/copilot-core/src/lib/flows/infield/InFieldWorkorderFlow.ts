import {
  InFieldWorkorderQueryChain,
  copilotDestinationInfieldWorkorderPrompt,
} from '@cognite/llm-hub';
import { Asset, CogniteClient } from '@cognite/sdk';

import { Flow } from '../../CogniteBaseFlow';
import { CopilotBotTextResponse } from '../../types';

type Input = {
  prompt: string;
  asset: Asset;
  activities: string[];
  sdk: CogniteClient;
};

export class InFieldWorkorderFlow extends Flow<Input, CopilotBotTextResponse> {
  label = 'Find workorders';
  description = copilotDestinationInfieldWorkorderPrompt.template;

  run: Flow<Input, CopilotBotTextResponse>['run'] = async ({
    prompt,
    sdk,
    asset,
    activities,
  }) => {
    const { content } = await InFieldWorkorderQueryChain.run({
      message: prompt,
      sdk,
      asset,
      activities,
    });

    const maxActivityLength = 12000;
    let tooMuchInformationCheck =
      activities.map((activity) => JSON.stringify(activity)).join(',').length >
      maxActivityLength;

    let result: string = content;

    result =
      (tooMuchInformationCheck
        ? `Too many work orders, using those with the soonest end time: \n &nbsp; \n` // Can be edited to also reflect the page language
        : '') +
      result +
      `\n &nbsp; \n*(Asset: ${asset.name || asset.externalId})*`;

    return {
      type: 'text',
      content: result,
      chain: this.constructor.name,
      actions: [
        {
          content: 'Source',
          toCopilotEvent: [
            'NEW_MESSAGES',
            [
              {
                source: 'bot',
                type: 'text',
                content: '1. Gathered from workorders',
              },
            ],
          ],
        },
      ],
    };
  };
}
