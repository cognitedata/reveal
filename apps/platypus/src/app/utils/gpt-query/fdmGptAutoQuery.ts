import { CogniteClient } from '@cognite/sdk';
import { some } from 'lodash';
import { getGraphQLQueryForFDM, getRelevantTypesPrompt } from './prompts';

type GptMessage = {
  role: 'user' | 'system' | 'assistant';
  content: string;
};

type GptRequest = {
  messages: GptMessage[];
  temperature?: number;
  maxTokens?: number;
  topP?: number;
};

type GptCompletionResponse = {
  data: {
    choices: {
      message: {
        role: string;
        content: string;
        finishReason: string;
      };
    }[];
  };
};

export async function fetchGptAutoQuery(
  naturalLanguageQuery: string,
  fdmSchema: string,
  sdk: CogniteClient
) {
  const relevantTypesPrompt = getRelevantTypesPrompt(fdmSchema);
  const gptRelevantTypesRequest: GptRequest = {
    messages: [
      {
        role: 'user',
        content: `You are Cognite CoPilot, a bot that solves tasks using Cognite Data Fusion
        Your decisions must always be made independently without seeking user assistance. Play to your strengths as an LLM and pursue simple strategies with no legal complications.`,
      },
      {
        role: 'user',
        content: relevantTypesPrompt,
      },
      {
        role: 'user',
        content: naturalLanguageQuery,
      },
    ],
    temperature: 0,
    maxTokens: 1000,
  };
  const response = await gpt(gptRelevantTypesRequest, sdk);
  const relevantTypes: string[] = JSON.parse(
    response[0].message.content
  ).relevantTypes;
  // todo error catch on parse

  // Here be danger, assuming a line with only a '}' separates each type in schema
  const allTypes = fdmSchema.split(/}/).map((x) => x + '\n}');
  const parsedRelevantTypes = allTypes.filter((p) =>
    some(relevantTypes.map((q) => p.trim().split('\n')[0].includes(q)))
  );

  const allRelevantTypes = parsedRelevantTypes
    .map((el) => el.replaceAll('{', '{ externalId: String!'))
    .join('\n');
  const gptGraphQlRequest: GptRequest = {
    messages: [
      {
        role: 'user',
        content: `You are Cognite CoPilot, a bot that solves tasks using Cogntie Data Fusion
        Your decisions must always be made independently withoutseeking user assistance. Play to your strengths as an LLM and pursue simple strategies with no legal complications.`,
      },
      {
        role: 'user',
        content:
          'Generate a only the GraphQL query for consumption by a computer.',
      },
      {
        role: 'user',
        content: getGraphQLQueryForFDM(allRelevantTypes),
      },
      {
        role: 'user',
        content:
          'Keep the response as short as possible and only include important properties. Include "__typename" in every single level of the query (within the "{ }" braces).',
      },
      {
        role: 'user',
        content: naturalLanguageQuery,
      },
    ],
    temperature: 0,
    maxTokens: 1500,
  };
  const response2 = await gpt(gptGraphQlRequest, sdk);
  let query = response2[0].message.content;
  // Trickery when GPT insists to prepend with human description
  if (query.includes('```')) {
    const codeStartIndex = query.indexOf('```');
    const codeEndIndex = query.indexOf('```', codeStartIndex + 3);
    query = query.substring(codeStartIndex + 3, codeEndIndex);
  }

  return query.trim();
}

async function gpt(request: GptRequest, sdk: CogniteClient) {
  const url = `/api/v1/projects/${sdk.project}/context/gpt/chat/completions`;
  const response = (await sdk.post(url, {
    data: request,
    withCredentials: true,
  })) as GptCompletionResponse;

  return response.data.choices;
}
