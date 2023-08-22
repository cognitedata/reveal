import { MultiPromptChain } from 'langchain/chains';
import { BaseChatModel } from 'langchain/chat_models/base';

import { CogniteClient } from '@cognite/sdk';

import { useTranslation } from '../../app/hooks/useTranslation';
import { CogniteBaseChain } from '../CogniteBaseChain';
import { CopilotMessage } from '../types';

import { createDefaultChain } from './conversation/base';
import { FusionQAChain } from './fusionQA/fusionQA';
import { GraphQlChain } from './graphql/graphql';
import { DocumentQueryChain } from './infield-chains/documentQueryChain';
import { DocumentSummaryChain } from './infield-chains/documentSummaryChain';
import { WorkorderChain } from './infield-chains/workorderChain';
import { AppBuilderChain } from './python/appBuilder';
import { getRouterChain } from './router/router';

export type CogniteChainName =
  | 'GraphQlChain'
  | 'AppBuilderChain'
  | 'DocumentQueryChain'
  | 'WorkorderChain'
  | 'DocumentSummaryChain'
  | 'FusionQAChain';

const destinationChains = (
  sdk: CogniteClient,
  model: BaseChatModel,
  messages: React.RefObject<CopilotMessage[]>,
  i18nFn: ReturnType<typeof useTranslation>['t']
): {
  [key in CogniteChainName]: CogniteBaseChain;
} =>
  [
    GraphQlChain,
    AppBuilderChain,
    DocumentQueryChain,
    FusionQAChain,
    DocumentSummaryChain,
    WorkorderChain,
  ].reduce(
    (prev, chain) => ({
      ...prev,
      [chain.name]: new chain({
        llm: model,
        sdk,
        messages,
        returnAll: true,
        humanApproval: false,
        i18nFn,
      }),
    }),
    {} as {
      [key in CogniteChainName]: CogniteBaseChain;
    }
  );

export const newChain = (
  sdk: CogniteClient, // TODO: remove this
  model: BaseChatModel,
  ref: React.RefObject<CopilotMessage[]>,
  excludeChains: CogniteChainName[] = [],
  i18nFn: ReturnType<typeof useTranslation>['t'] = (key: string) => key
) => {
  const chains = destinationChains(sdk, model, ref, i18nFn);
  const templates = Object.entries(chains)
    // make sure the key is not excluded in the `chains` that the user wants
    .filter(([key]) => !excludeChains.includes(key as CogniteChainName))
    // map to the correct format that the router expects
    .map(([key, chain]) => {
      return { name: key, description: chain.description };
    });

  const routerChain = getRouterChain(model, templates);

  const defaultChain = createDefaultChain(model);

  return {
    base: new MultiPromptChain({
      routerChain,
      destinationChains: chains,
      defaultChain,
      callbacks: [
        {
          handleChainStart(chain) {
            console.log('chain started', chain);
          },
          handleChainEnd(chain, output) {
            console.log('chain ended', chain, output);
          },
        },
      ],
    }),
    chains,
  };
};
