import { MultiPromptChain } from 'langchain/chains';
import { BaseChatModel } from 'langchain/chat_models/base';

import { CogniteClient } from '@cognite/sdk';

import { CogniteBaseChain } from '../types';

import { createDefaultChain } from './conversation/base';
import { GraphQlChain } from './graphql/graphql';
import { AppBuilderChain } from './python/appBuilder';
import { getRouterChain } from './router/router';

type ChainName = 'GraphQlChain' | 'AppBuilderChain';

const destinationChains = (
  sdk: CogniteClient,
  model: BaseChatModel
): {
  [key in ChainName]: CogniteBaseChain;
} => ({
  GraphQlChain: new GraphQlChain({
    llm: model,
    sdk,
    returnAll: true,
    verbose: true,
    types: ['Pump', 'Valve', 'Motor'],
  }),
  AppBuilderChain: new AppBuilderChain({
    llm: model,
    sdk,
    returnAll: true,
    verbose: true,
  }),
});

export const newChain = (
  sdk: CogniteClient, // TODO: remove this
  model: BaseChatModel,
  excludeChains: ChainName[] = []
) => {
  const chains = destinationChains(sdk, model);
  const templates = Object.entries(chains)
    // make sure the key is not excluded in the `chains` that the user wants
    .filter(([key]) => !excludeChains.includes(key as ChainName))
    // map to the correct format that the router expects
    .map(([key, chain]) => {
      return { name: key, description: chain.description };
    });

  const routerChain = getRouterChain(model, templates);

  const defaultChain = createDefaultChain(model);

  return new MultiPromptChain({
    routerChain,
    destinationChains: chains,
    defaultChain,
    verbose: true,
  });
};
