import { GraphQlUtilsService } from '@platypus/platypus-common-utils';
import { FdmMixerApiService } from '@platypus/platypus-core';
import { jsonrepair } from 'jsonrepair';
import {
  BaseCallbackHandler,
  CallbackManager,
  CallbackManagerForChainRun,
} from 'langchain/callbacks';
import { LLMChain } from 'langchain/chains';
import { BaseChatModel } from 'langchain/chat_models/base';
import { PromptTemplate } from 'langchain/prompts';
import { ChainValues } from 'langchain/schema';

import {
  copilotDestinationGraphqlPrompt,
  datamodelAggregateFieldsPrompt,
  datamodelQueryFilterPrompt,
  datamodelQueryTypePrompt,
  datamodelRelevantPropertiesPrompt,
  datamodelRelevantTypePrompt,
} from '@cognite/llm-hub';

import {
  CogniteBaseChain,
  CogniteChainInput,
  CopilotMessage,
} from '../../types';
import {
  addToCopilotEventListener,
  sendFromCopilotEvent,
  sendToCopilotEvent,
} from '../../utils';

import {
  augmentQueryWithRequiredFields,
  getFilterTypeName,
  getOperationName,
  type QueryType,
  type GptGQLFilter,
  getFields,
  constructFilter,
  constructGraphQLTypes,
} from './utils';
const handleChainStart =
  (messages: CogniteChainInput['messages']) => async (): Promise<void> => {
    return new Promise((resolve) => {
      if (getLatestDataModelMessage(messages.current || [])) {
        return resolve();
      }
      sendToCopilotEvent('NEW_MESSAGES', [
        {
          source: 'bot',
          type: 'data-model',
          content: 'Which data model are you referring to?',
          pending: true,
          chain: 'GraphQlChain',
        },
      ]);

      const removeListener = addToCopilotEventListener(
        'NEW_MESSAGES',
        (data) => {
          if (
            data.length === 1 &&
            data[0].type === 'data-model' &&
            !!data[0].space &&
            !!data[0].dataModel &&
            !!data[0].version &&
            !data[0].pending
          ) {
            removeListener();
            return resolve();
          }
        }
      );
    });
  };

/**
 * Chain to run queries against LLMs.
 *
 * @example
 * ```ts
 * import { LLMChain } from "langchain/chains";
 * import { CogniteChatGPT} from "@cognite/copilot-core"
 * import { PromptTemplate } from "langchain/prompts";
 *
 * const chain = new GraphQlChain({
 *   llm: new CogniteChatGPT(),
 *   returnAll: true,
 *   verbose: true,
 *   types: ['Pump', 'Valve', 'Motor']
 * });
 *
 * const prompt = 'List all valves belonging to pump 23';
 *
 * const res = await chain.call({ input: prompt});
 * ```
 */
export class GraphQlChain extends CogniteBaseChain {
  llm: BaseChatModel;
  outputVariables: string[];
  returnAll?: boolean | undefined;

  description = copilotDestinationGraphqlPrompt.template;

  constructor(private fields: CogniteChainInput) {
    super(fields);
    this.llm = fields.llm;
    this.outputVariables = fields.outputVariables ?? [];
    if (this.outputVariables.length > 0 && fields.returnAll) {
      throw new Error(
        'Either specify variables to return using `outputVariables` or use `returnAll` param. Cannot apply both conditions at the same time.'
      );
    }
    this.returnAll = fields.returnAll ?? false;

    // TODO refactor to generic class soon
    if (this.callbacks instanceof CallbackManager) {
      this.callbacks.addHandler(
        BaseCallbackHandler.fromMethods({
          handleChainStart: handleChainStart(this.fields.messages),
        })
      );
    } else {
      this.callbacks = [
        ...(this.callbacks || []),
        BaseCallbackHandler.fromMethods({
          handleChainStart: handleChainStart(this.fields.messages),
        }),
      ];
    }
  }

  get inputKeys() {
    return datamodelRelevantTypePrompt.input_variables;
  }

  get outputKeys(): string[] {
    return this.outputVariables;
  }

  _chainType() {
    return 'sequential_chain' as const;
  }

  /** @ignore */
  async _call(
    values: ChainValues,
    _runManager?: CallbackManagerForChainRun
  ): Promise<ChainValues> {
    const details = getLatestDataModelMessage(
      this.fields.messages.current || []
    );
    if (!details) {
      throw new Error(`Data model not speified`);
    }
    const { space, dataModel, version } = details;
    const versions = await new FdmMixerApiService(
      this.fields.sdk
    ).getDataModelVersionsById(space, dataModel);
    const dmVersion = versions.find((el) => el.version === version);
    if (!dmVersion) {
      throw new Error(
        `Data model ${dataModel} version ${version} not found in space ${space}`
      );
    }
    if (!dmVersion?.graphQlDml) {
      throw new Error('Data model is empty');
    }
    const dataModelTypes = new GraphQlUtilsService().parseSchema(
      dmVersion?.graphQlDml
    );

    try {
      // Chain 1: Extract relevant types
      const graphQlRelevantTypesChain = new LLMChain({
        llm: this.llm,
        prompt: new PromptTemplate({
          template: datamodelRelevantTypePrompt.template,
          inputVariables: datamodelRelevantTypePrompt.input_variables,
        }),
        outputKey: 'output',
        verbose: true,
      });

      const typeNames = dataModelTypes.types.map((el) => el.name);

      const { output: relevantTypesResponse } =
        await graphQlRelevantTypesChain.call({
          question: values.input,
          types: typeNames,
        });

      const { relevantTypes } = JSON.parse(
        jsonrepair(relevantTypesResponse.replaceAll('\n', ''))
      ) as { relevantTypes: string[] };

      console.log(relevantTypes);

      const filteredTypes = relevantTypes.filter((el) =>
        typeNames.includes(el)
      );

      if (filteredTypes.length === 0) {
        throw new Error('No relevant types found');
      }

      // Chain 2: Identify correct operation and type
      const graphqlOperationChain = new LLMChain({
        llm: this.llm,
        prompt: new PromptTemplate({
          template: datamodelQueryTypePrompt.template,
          inputVariables: datamodelQueryTypePrompt.input_variables,
        }),
        outputKey: 'output',
        verbose: true,
      });

      const { output: operationResponse } = await graphqlOperationChain.call({
        question: values.input,
        relevantTypes: filteredTypes,
      });

      const { queryType, type } = JSON.parse(
        jsonrepair(operationResponse.replaceAll('\n', ''))
      ) as {
        queryType: QueryType;
        type: string;
      };

      if (
        !['list', 'aggregate'].includes(queryType) ||
        !filteredTypes.includes(type)
      ) {
        throw new Error('Invalid query type or type');
      }

      const operationName = getOperationName(queryType, type);
      const filterTypeName = getFilterTypeName(queryType, type);

      let variables: any = {};
      let query: string = '';

      if (queryType === 'list') {
        // List - Chain 3: Identify relevant fields for aggregate
        const aggregateFieldsChain = new LLMChain({
          llm: this.llm,
          prompt: new PromptTemplate({
            template: datamodelRelevantPropertiesPrompt.template,
            inputVariables: datamodelRelevantPropertiesPrompt.input_variables,
          }),
          outputKey: 'output',
          verbose: true,
        });

        const { output: aggregateFieldsResponse } =
          await aggregateFieldsChain.call({
            question: values.input,
            relevantTypes: constructGraphQLTypes(filteredTypes, dataModelTypes),
          });

        const fields = JSON.parse(
          jsonrepair(aggregateFieldsResponse.replaceAll('\n', ''))
        ) as {
          [key: string]: string[];
        };

        // validate values
        Object.entries(fields).forEach(([key, values]) => {
          if (!relevantTypes.includes(key)) {
            delete fields[key];
          }
          const typeDef = dataModelTypes.types.find((el) => el.name === key);
          let validFields = [];
          for (let field of values) {
            if (typeDef?.fields.some((el) => el.name === field)) {
              validFields.push(field);
            }
          }
          fields[key] = validFields;
        });
        query = augmentQueryWithRequiredFields(
          `query ${operationName} ($filter: ${filterTypeName}) {
          ${operationName}(filter: $filter) 
          ${getFields(
            type,
            new Map(Object.entries(fields)),
            dataModelTypes,
            true
          )}
        }`,
          dataModelTypes
        );
      } else {
        const typePropertiesForAggregate =
          dataModelTypes.types
            .find((dataType) => dataType.name === type)
            ?.fields.filter(
              // custom and list fields are not supported
              (field) => !(field.type.list || field.type.custom)
            ) || [];
        // List - Chain 3: Identify relevant fields for type
        const relevantFieldsChain = new LLMChain({
          llm: this.llm,
          prompt: new PromptTemplate({
            template: datamodelAggregateFieldsPrompt.template,
            inputVariables: datamodelAggregateFieldsPrompt.input_variables,
          }),
          outputKey: 'output',
          verbose: true,
        });

        const { output: relevantFieldsResponse } =
          await relevantFieldsChain.call({
            question: values.input,
            typeProperties: typePropertiesForAggregate.map(
              (field) => `${field.name}: ${field.type.name}`
            ),
            typeName: type,
          });

        const aggregateFields = JSON.parse(
          jsonrepair(relevantFieldsResponse.replaceAll('\n', ''))
        ) as {
          groupBy?: string;
          aggregateProperties: { [key in string]: string[] };
        };

        // validate values
        if (
          aggregateFields.groupBy &&
          !typePropertiesForAggregate.some(
            (el) => el.name === aggregateFields.groupBy
          )
        ) {
          throw new Error(
            `Cannot aggregate on this field - ${aggregateFields.groupBy} for ${type}`
          );
        }
        query = `query ${operationName} ($filter: ${filterTypeName}, $groupBy: [_Search${type}Fields!]) {
          ${operationName}(filter: $filter, groupBy: $groupBy) {
            items {
              group
              ${Object.entries(aggregateFields.aggregateProperties).map(
                ([key, values]) => {
                  const realFields = typePropertiesForAggregate.filter((el) =>
                    values.includes(el.name)
                  );
                  if (key === 'count' && realFields.length === 0) {
                    return 'count { externalId }';
                  }
                  if (realFields.length === 0) {
                    throw new Error(`no relevant field to group on for ${key}`);
                  }
                  return `${key} { ${realFields
                    .map((el) => el.name)
                    .join('\n')} }`;
                }
              )}
            }
          }
        }`;
        variables = aggregateFields.groupBy
          ? { groupBy: [aggregateFields.groupBy] }
          : {};
      }

      // Chain 4: Indentify relevant filter
      const queryFilterChain = new LLMChain({
        llm: this.llm,
        prompt: new PromptTemplate({
          template: datamodelQueryFilterPrompt.template,
          inputVariables: datamodelQueryFilterPrompt.input_variables,
        }),
        outputKey: 'output',
        verbose: true,
      });

      const { output: queryFilterResponse } = await queryFilterChain.call({
        question: values.input,
        relevantTypes: constructGraphQLTypes(filteredTypes, dataModelTypes),
      });
      const filter = JSON.parse(
        jsonrepair(queryFilterResponse.replaceAll('\n', ''))
      ) as GptGQLFilter;

      variables = { ...variables, filter: constructFilter(filter) };

      const constructedFilter = constructFilter(filter);

      // Get summary
      const queryService = new FdmMixerApiService(this.fields.sdk);

      const response = await queryService.runQuery({
        dataModelId: dataModel,
        schemaVersion: version,
        space: space,
        graphQlParams: {
          query: query,
          variables,
        },
      });

      // assume no aggregate atm
      const summary =
        queryType === 'list'
          ? `${response.data[operationName]['items'].length}+`
          : JSON.stringify(response.data[operationName]['items']);

      sendToCopilotEvent('NEW_MESSAGES', [
        {
          source: 'bot',
          type: 'data-model-query',
          version,
          space,
          dataModel,
          content: `Found ${summary} results for ${type}`,
          graphql: { query, variables },
          chain: this.constructor.name,
          actions: [
            {
              content: 'Debug',
              onClick: () => {
                console.log('query', query);
                console.log('variables', variables);
                navigator.clipboard.writeText(
                  JSON.stringify({
                    query,
                    variables,
                  })
                );
              },
            },
          ],
        },
      ]);
      sendFromCopilotEvent('GQL_QUERY', {
        query: query,
        variables,
      });

      return {
        query: JSON.stringify({
          query,
          variables,
        }),
      };
    } catch (e) {
      console.log(e);
      // Sentry.captureException(e);
      sendToCopilotEvent('NEW_MESSAGES', [
        {
          source: 'bot',
          type: 'text',
          content: 'Unable to find any data, can you try again?',
          chain: this.constructor.name,
        },
      ]);
    }
    return { query: 'query' };
  }
}

const getLatestDataModelMessage = (messages: CopilotMessage[] = []) => {
  const dataModelSelectionMsg = [...messages]
    .reverse()
    .find((el) => el.type === 'data-model');
  if (
    dataModelSelectionMsg &&
    dataModelSelectionMsg.type === 'data-model' &&
    !!dataModelSelectionMsg.space &&
    !!dataModelSelectionMsg.dataModel &&
    !!dataModelSelectionMsg.version &&
    !dataModelSelectionMsg.pending
  ) {
    return {
      space: dataModelSelectionMsg.space,
      version: dataModelSelectionMsg.version,
      dataModel: dataModelSelectionMsg.dataModel,
    };
  }
  return undefined;
};
