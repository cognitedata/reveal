import { SummarizeGraphQL } from '@cognite/llm-hub';
import { CogniteClient } from '@cognite/sdk';

import { Flow } from '../../CogniteBaseFlow';
import { CopilotBotTextResponse } from '../../types';

type DataModelSelectorOutput = {
  prompt: string;
  sdk: CogniteClient;
  query: string;
  variables: any;
  queryType: string;
  relevantTypes: string[];
};
export class GraphQlSummaryFlow extends Flow<
  DataModelSelectorOutput,
  CopilotBotTextResponse
> {
  label = 'Find data';
  description = 'Find data from data model';

  run: Flow<DataModelSelectorOutput, CopilotBotTextResponse>['run'] = async ({
    prompt,
    sdk,
    query,
    variables,
    queryType,
    relevantTypes,
  }) => {
    const { summary } = await SummarizeGraphQL.run({
      message: prompt,
      sdk,
      query,
      variables,
      queryType,
      relevantTypes,
    });

    return {
      source: 'bot',
      type: 'text',
      content: summary,
    };
  };
}
