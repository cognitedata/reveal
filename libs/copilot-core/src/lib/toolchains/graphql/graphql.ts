import { GraphQlUtilsService } from '@platypus/platypus-common-utils';
import { FdmMixerApiService } from '@platypus/platypus-core';

import {
  copilotDestinationGraphqlPrompt,
  datamodelAggregateFieldsPrompt,
  datamodelQueryFilterPrompt,
  datamodelQueryTypePrompt,
  datamodelRelevantPropertiesPrompt,
  datamodelRelevantTypePrompt,
} from '@cognite/llm-hub';

import {
  ChainStage,
  ChainType,
  CogniteBaseChain,
  callPromptChain,
  safeConvertToJson,
} from '../../CogniteBaseChain';
import { CopilotMessage } from '../../types';
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
  description = copilotDestinationGraphqlPrompt.template;
  chain: ChainType = 'sequential_chain';

  stages: ChainStage[] = [
    dataModelStage,
    {
      name: 'process-graphql',
      loadingMessage: 'Finding data...',
      run: async ({ message, messages, llm, sdk }) => {
        const details = getLatestDataModelMessage(messages.current || []);
        if (!details) {
          throw new Error(`Data model not speified`);
        }
        const { space, dataModel, version } = details;
        const versions = await new FdmMixerApiService(
          sdk
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
          const typeNames = dataModelTypes.types.map((el) => el.name);

          const [{ relevantTypes }] = await callPromptChain(
            this,
            datamodelRelevantTypePrompt,
            [
              {
                question: message,
                types: typeNames,
              },
            ]
          ).then(safeConvertToJson<{ relevantTypes: string[] }>);

          const filteredTypes = relevantTypes.filter((el) =>
            typeNames.includes(el)
          );

          if (filteredTypes.length === 0) {
            throw new Error('No relevant types found');
          }

          // Chain 2: Identify correct operation and type
          const [{ queryType, type }] = await callPromptChain(
            this,
            datamodelQueryTypePrompt,
            [
              {
                question: message,
                relevantTypes: filteredTypes,
              },
            ]
          ).then(
            safeConvertToJson<{
              queryType: QueryType;
              type: string;
            }>
          );

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
            const [fields] = await callPromptChain(
              this,
              datamodelRelevantPropertiesPrompt,
              [
                {
                  question: message,
                  relevantTypes: constructGraphQLTypes(
                    filteredTypes,
                    dataModelTypes
                  ),
                },
              ]
            ).then(
              safeConvertToJson<{
                [key: string]: string[];
              }>
            );
            // validate values
            Object.entries(fields).forEach(([key, values]) => {
              if (!relevantTypes.includes(key)) {
                delete fields[key];
              }
              const typeDef = dataModelTypes.types.find(
                (el) => el.name === key
              );
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
            const [aggregateFields] = await callPromptChain(
              this,
              datamodelAggregateFieldsPrompt,
              [
                {
                  question: message,
                  typeProperties: typePropertiesForAggregate.map(
                    (field) => `${field.name}: ${field.type.name}`
                  ),
                  typeName: type,
                },
              ]
            ).then(
              safeConvertToJson<{
                groupBy?: string;
                aggregateProperties: { [key in string]: string[] };
              }>
            );

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
                      throw new Error(
                        `no relevant field to group on for ${key}`
                      );
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
          const [filter] = await callPromptChain(
            this,
            datamodelQueryFilterPrompt,
            [
              {
                question: message,
                relevantTypes: constructGraphQLTypes(
                  filteredTypes,
                  dataModelTypes
                ),
              },
            ]
          ).then(safeConvertToJson<GptGQLFilter>);

          variables = { ...variables, filter: constructFilter(filter) };

          // Get summary
          const queryService = new FdmMixerApiService(sdk);

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
            data: {
              query,
              variables,
            },
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
        return { data: null };
      },
    },
  ];
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

const dataModelStage: ChainStage = {
  name: 'data-model',
  loadingMessage: 'Confirming data model...',
  run: async ({ messages }) => {
    if (getLatestDataModelMessage(messages.current || [])) {
      return { abort: false, data: {} };
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

    return new Promise((resolve) => {
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
            return resolve({ abort: false, data: {} });
          }
        }
      );
    });
  },
};
