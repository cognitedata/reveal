import { LLMRouterChain } from 'langchain/chains';
import { BaseLanguageModel } from 'langchain/dist/base_language';
import { RouterOutputParser } from 'langchain/output_parsers';
import { PromptTemplate } from 'langchain/prompts';
import { z } from 'zod';

import { copilotRouterPrompt } from '@cognite/llm-hub';

export const getRouterChain = (
  model: BaseLanguageModel,
  templates: { name: string; description: string }[]
) => {
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
    inputVariables: ['input', 'sdk', 'pastMessages'],
    outputParser: routerParser,
    partialVariables: {
      format_instructions: routerFormat,
      destinations: destinations,
    },
  });

  return LLMRouterChain.fromLLM(model, routerPrompt);
};
