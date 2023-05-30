import { print, parse } from 'graphql';
import { some } from 'lodash';

import { CogniteClient } from '@cognite/sdk';

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
  const schemaDoc = parse(fdmSchema);

  const relevantTypesPrompt = getRelevantTypesPrompt(fdmSchema);
  const gptRelevantTypesRequest: GptRequest = {
    messages: [
      {
        role: 'user',
        content: `You are Cognite CoPilot, an AI assistant that converts natural language into GraphQL queries.
        Your decisions must always be made independently withoutseeking user assistance. Play to your strengths as an LLM and pursue simple strategies with no legal complications.
        You are an expert and make no mistakes on syntax. 
        You remember all rules you are told.
        `,
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

  // todo error catch on parse
  const relevantTypes: string[] = JSON.parse(
    response[0].message.content
  ).relevantTypes;

  // Extract the type definitions that are relevant for the query based on previous query
  const relevantTypeDefinitions = schemaDoc.definitions.filter((p) => {
    if (p.kind === 'ObjectTypeDefinition') {
      return relevantTypes.includes(p.name.value);
    }
    return false;
  });

  let relevantSchema = print({
    ...schemaDoc,
    definitions: relevantTypeDefinitions,
  });

  if (fdmSchema.length < 13000) {
    // For the gartner demo, we want to use the full schema
    // We should also traverse the dependency types in the relevantTypeDefinitions to include
    // the full tree of types that are needed for the query
    relevantSchema = fdmSchema;
  }

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
        content: getGraphQLQueryForFDM(relevantSchema),
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
