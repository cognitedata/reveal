import {
  LLMChain,
  LLMRouterChain,
  LLMRouterChainInput,
  RouterOutputSchema,
} from 'langchain/chains';
import { BaseLanguageModel } from 'langchain/dist/base_language';
import { Route } from 'langchain/dist/chains/router/multi_route';
import { RouterOutputParser } from 'langchain/output_parsers';
import { BasePromptTemplate, PromptTemplate } from 'langchain/prompts';
import { z } from 'zod';

import { copilotRouterPrompt } from '@cognite/llm-hub';

import { parallelGPTCalls } from '../../CogniteBaseChain';
import { addToCopilotLogs } from '../../utils/logging';

export const getRouterChain = (
  model: BaseLanguageModel,
  templates: { name: string; description: string }[]
) => {
  const currentRuns: Map<string, string> = new Map();
  let destinations = templates
    .map((item) => item.name + ': ' + item.description)
    .join('\n');

  let routerParser = RouterOutputParser.fromZodSchema(
    z.object({
      destination: z
        .string()
        .describe('name of the prompt to use or "DEFAULT"'),
      next_inputs: z.object({
        input: z
          .string()
          .describe('a potentially modified version of the original input'),
      }),
    })
  );
  let routerFormat = routerParser.getFormatInstructions();

  // Now we can construct the router with the list of route names and descriptions
  let routerPrompt = new PromptTemplate({
    template: copilotRouterPrompt.template,
    inputVariables: ['input', 'sdk', 'pastMessages', 'key'],
    outputParser: routerParser,
    partialVariables: {
      format_instructions: routerFormat,
      destinations: destinations,
    },
  });

  return CogniteLLMRouterChain.fromLLM(model, routerPrompt, {
    callbacks: [
      {
        handleChainStart(_chain, value, runId, _pid, tags) {
          addToCopilotLogs(value.key, {
            key: 'router',
            content: `identifying best tool based on user intent`,
          });
          // TODO: this is a hack to make sure that the router is only called once per message
          currentRuns.set(value.key, runId);
          tags?.push(value.key);
        },
        handleChainEnd(output, runId, _pid, tags = []) {
          addToCopilotLogs(tags[0], {
            key: 'router',
            content: `using - ${output.destination}`,
          });
          if (currentRuns.get(tags[0]) !== runId) {
            throw new Error('Skip');
          }
        },
      },
    ],
  });
};

class CogniteLLMRouterChain extends LLMRouterChain {
  async route(...values: Parameters<LLMRouterChain['route']>): Promise<Route> {
    return (
      await parallelGPTCalls<LLMRouterChain>(
        [values[0]],
        this,
        3,
        6000, // 6 seconda before retry
        async (item, value) => {
          const result = await item.call(value, values[1]);
          return {
            destination: result.destination,
            nextInputs: result.next_inputs,
          };
        }
      )
    )[0];
  }

  static fromLLM(
    llm: BaseLanguageModel,
    prompt: BasePromptTemplate,
    options?: Omit<LLMRouterChainInput, 'llmChain'>
  ) {
    const llmChain = new LLMChain<RouterOutputSchema>({ llm, prompt });
    return new CogniteLLMRouterChain({ ...options, llmChain });
  }
}
