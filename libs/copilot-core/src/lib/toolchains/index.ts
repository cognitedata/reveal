import { BaseChatModel } from 'langchain/chat_models/base';

import { CogniteClient } from '@cognite/sdk';

import { useTranslation } from '../../app/hooks/useTranslation';
import {
  ChainStage,
  ChainType,
  CogniteBaseChain,
  CogniteChainInput,
} from '../CogniteBaseChain';
import { CopilotMessage } from '../types';

import { FusionQAChain } from './fusionQA/fusionQA';
import { GraphQlChain } from './graphql/graphql';
import { DocumentQueryChain } from './infield-chains/documentQueryChain';
import { DocumentSummaryChain } from './infield-chains/documentSummaryChain';
import { WorkorderChain } from './infield-chains/workorderChain';
import { AppBuilderChain } from './python/appBuilder';

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
  i18nFn: ReturnType<typeof useTranslation>['t'] = (key: string) => key
) => {
  const chains = destinationChains(sdk, model, ref, i18nFn);

  return {
    base: new RouterChain({
      llm: model,
      sdk,
      messages: ref,
      returnAll: true,
      humanApproval: false,
      i18nFn,
      chains,
    }),
    chains,
  };
};

class RouterChain extends CogniteBaseChain {
  constructor(
    protected fields: CogniteChainInput & {
      chains: ReturnType<typeof destinationChains>;
    }
  ) {
    super(fields);
  }
  name = 'Routes users';
  description = 'Chain to decide what to call';
  chain: ChainType = 'sequential_chain';

  stages: ChainStage<any, any>[] = [
    {
      loadingMessage: 'Deciding what to call...',
      name: 'router',
      run: async ({ message, messages }) => {
        if (messages.current?.length === 0) {
          throw new Error('Should not be here');
        }
        const firstUserMessage = messages.current?.find(
          (el) => el.source === 'user'
        );

        if (firstUserMessage?.type !== 'chain') {
          throw new Error('Old chat');
        }
        return {
          data: await this.fields.chains[firstUserMessage.chain].call({
            input: message,
          }),
        };
      },
    },
  ];
}
