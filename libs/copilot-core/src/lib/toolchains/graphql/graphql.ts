import { GraphQlUtilsService } from '@platypus/platypus-common-utils';
import {
  DataModelTypeDefs,
  FdmMixerApiService,
  GraphQlDmlVersionDTO,
} from '@platypus/platypus-core';

import {
  copilotDestinationGraphqlPrompt,
  datamodelAggregateFieldsPrompt,
  datamodelQueryFilterPrompt,
  datamodelQueryTypePrompt,
  datamodelRelevantPropertiesPrompt,
  datamodelRelevantTypeMultiModelsPrompt,
  datamodelResultSummaryPrompt,
} from '@cognite/llm-hub';

import {
  ChainStage,
  ChainType,
  CogniteBaseChain,
  callPromptChain,
  safeConvertToJson,
} from '../../CogniteBaseChain';
import { CopilotMessage } from '../../types';
import { addToCopilotEventListener, sendToCopilotEvent } from '../../utils';
import { addToCopilotLogs, getCopilotLogs } from '../../utils/logging';

import {
  augmentQueryWithRequiredFields,
  getFilterTypeName,
  getOperationName,
  type QueryType,
  type GptGQLFilter,
  getFields,
  constructFilterForTypes,
  constructGraphQLTypes,
  getTypeString,
  constructListResultSummary,
  constructAggregateResultSummary,
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

type ProcessGraphQLOutput = {
  omitted: { key: string; reason: string }[];
  relevantTypes: string[];
  dataModel: string;
  dataModels: GraphQlDmlVersionDTO[];
} & DataModelSelectorOutput;
type PostProcessGraphQLOutput = {
  filteredTypes: string[];
  dataModelTypes: DataModelTypeDefs;
  selectedDataModel: GraphQlDmlVersionDTO;
} & ProcessGraphQLOutput;

type QueryAndMainTypeOutput = {
  queryType: QueryType;
  type: string;
} & PostProcessGraphQLOutput;

type FilterOutput = {
  variables: { [key in string]: any };
} & QueryAndMainTypeOutput;

type QueryOutput = {
  query: string;
} & FilterOutput;
export class GraphQlChain extends CogniteBaseChain {
  description = copilotDestinationGraphqlPrompt.template;
  chain: ChainType = 'sequential_chain';

  stages: ChainStage[] = [
    {
      name: 'data-model',
      loadingMessage: this.fields.i18nFn('GQL_STAGE_FIND_DATA_MODEL'),
      run: async ({ messages, i18nFn }) => {
        const selectedDataModels = getLatestDataModelMessage(
          messages.current || []
        );
        if (selectedDataModels.length > 0) {
          return { abort: false, data: { selectedDataModels } };
        }
        sendToCopilotEvent('NEW_MESSAGES', [
          {
            source: 'bot',
            type: 'data-models',
            dataModels: [],
            content: i18nFn('GQL_CHAIN_CHOOSE_DM'),
            pending: true,
            chain: 'GraphQlChain',
          },
        ]);

        return new Promise((resolve) => {
          const removeListener = addToCopilotEventListener(
            'NEW_MESSAGES',
            (data) => {
              const newSelectedDataModels = getLatestDataModelMessage(data);
              if (newSelectedDataModels?.length > 0) {
                removeListener();
                return resolve({
                  abort: false,
                  data: { selectedDataModels: newSelectedDataModels },
                });
              }
            }
          );
        });
      },
    },
    {
      name: 'relevant data type',
      loadingMessage: this.fields.i18nFn('GQL_STAGE_RELEVANT_TYPES'),
      run: async ({ message, sdk, i18nFn }, { selectedDataModels }) => {
        const omitted: { key: string; reason: string }[] = [];
        if (!selectedDataModels) {
          throw new Error(i18nFn('GQL_ERROR_DATA_MODEL_MISSING'));
        }
        const allDataModels = await new FdmMixerApiService(
          sdk
        ).listDataModelVersions();

        const dataModels = allDataModels.filter((dataModel) =>
          selectedDataModels.some(
            (el) =>
              // ignoring `version` for now
              el.dataModel === dataModel.externalId &&
              el.space === dataModel.space
          )
        );

        const [{ relevantTypes, dataModel }] = await callPromptChain(
          this,
          'relevant types',
          datamodelRelevantTypeMultiModelsPrompt,
          [
            {
              question: message,
              types: getTypeString(dataModels),
            },
          ]
        )
          .then(safeConvertToJson<Omit<ProcessGraphQLOutput, 'omitted'>>)
          .catch(() => {
            throw new Error(i18nFn('GQL_ERROR_RELEVANT_TYPES'));
          });
        return { data: { omitted, relevantTypes, dataModel, dataModels } };
      },
    } as ChainStage<DataModelSelectorOutput, ProcessGraphQLOutput>,
    {
      name: 'data type processing',
      loadingMessage: this.fields.i18nFn('GQL_STAGE_PROCESSING_RELEVANT_TYPES'),
      run: async (
        { i18nFn },
        { relevantTypes, dataModel: dataModelName, dataModels }
      ) => {
        const selectedDataModel =
          dataModels.find(
            (dataModel) =>
              `${dataModel.externalId}_${dataModel.space}` === dataModelName
          ) || dataModels[0];

        if (!selectedDataModel || !selectedDataModel.graphQlDml) {
          throw new Error(i18nFn('GQL_ERROR_MISSING_DEFINITION'));
        }

        const dataModelTypes = new GraphQlUtilsService().parseSchema(
          selectedDataModel.graphQlDml,
          selectedDataModel.views
        );

        const filteredTypes = relevantTypes.filter((el) =>
          dataModelTypes.types.some((type) => type.name === el)
        );

        if (filteredTypes.length === 0) {
          throw new Error(i18nFn('GQL_ERROR_RELEVANT_TYPES'));
        }
        return { data: { filteredTypes, dataModelTypes, selectedDataModel } };
      },
    } as ChainStage<PostProcessGraphQLOutput, ProcessGraphQLOutput>,
    {
      name: 'identify query type',
      loadingMessage: this.fields.i18nFn('GQL_STAGE_QUERY_TYPE'),
      run: async ({ message, i18nFn }, { filteredTypes }) => {
        // Chain 2: Identify correct operation and type
        const [{ queryType, type }] = await callPromptChain(
          this,
          'operation and type',
          datamodelQueryTypePrompt,
          [
            {
              question: message,
              relevantTypes: filteredTypes,
            },
          ]
        )
          .then(safeConvertToJson<QueryAndMainTypeOutput>)
          .catch(() => {
            throw new Error(i18nFn('GQL_ERROR_INVALID_QUERY_TYPE'));
          });
        if (
          !['list', 'aggregate'].includes(queryType) ||
          !filteredTypes.includes(type)
        ) {
          throw new Error(i18nFn('GQL_ERROR_INVALID_QUERY_TYPE'));
        }
        return { data: { queryType, type } };
      },
    } as ChainStage<QueryAndMainTypeOutput, PostProcessGraphQLOutput>,
    {
      name: 'generating filter',
      loadingMessage: this.fields.i18nFn('GQL_STAGE_FILTER'),
      run: async (
        { message, i18nFn },
        { filteredTypes, dataModelTypes, relevantTypes, omitted }
      ) => {
        try {
          const relevantTypesDml = constructGraphQLTypes(
            filteredTypes,
            dataModelTypes
          );
          // Chain 4: Identify relevant filter
          const [filterResponse] = await callPromptChain(
            this,
            'filter',
            datamodelQueryFilterPrompt,
            [
              {
                question: message,
                relevantTypes: relevantTypesDml,
              },
            ],
            { timeout: 30000 }
          ).then(safeConvertToJson<GptGQLFilter>);
          const {
            filter,
            omitted: omittedFromFilters,
            type: newMainType,
          } = constructFilterForTypes(
            this.messageKey,
            filterResponse,
            relevantTypes,
            dataModelTypes
          );

          omitted.push(...omittedFromFilters);
          const variables: any = { filter };

          addToCopilotLogs(this.messageKey, {
            content: `\`\`\`graphql\n${relevantTypesDml}\n\`\`\``,
            key: 'graphql types',
          });
          addToCopilotLogs(this.messageKey, {
            content: `\`\`\`json\n${JSON.stringify(
              omittedFromFilters,
              null,
              2
            )}\n\`\`\``,
            key: 'omitted filters',
          });

          return { data: { variables, type: newMainType } };
        } catch {
          throw new Error(i18nFn('GQL_ERROR_FILTER'));
        }
      },
    } as ChainStage<FilterOutput, QueryAndMainTypeOutput>,
    {
      name: 'creating query',
      loadingMessage: this.fields.i18nFn('GQL_STAGE_CREATE_QUERY'),
      run: async (
        { message, i18nFn },
        {
          omitted,
          relevantTypes,
          filteredTypes,
          dataModelTypes,
          queryType,
          variables,
          type,
        }
      ) => {
        let query: string = '';
        const operationName = getOperationName(queryType, type);
        const filterTypeName = getFilterTypeName(queryType, type);

        if (queryType === 'list') {
          // List - Chain 3: Identify relevant fields for aggregate
          const [fields] = await callPromptChain(
            this,
            'relevant fields',
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
          )
            .then(
              safeConvertToJson<{
                [key: string]: string[];
              }>
            )
            .catch(() => {
              throw new Error(i18nFn('GQL_ERROR_INVALID_FIELDS'));
            });
          // validate values
          // TODO extract
          Object.entries(fields).forEach(([key, values]) => {
            if (!relevantTypes.includes(key)) {
              omitted.push({
                key: key,
                reason: `invalid type`,
              });
              delete fields[key];
            }
            const typeDef = dataModelTypes.types.find((el) => el.name === key);
            let validFields = [];
            for (let field of values) {
              if (typeDef?.fields.some((el) => el.name === field)) {
                validFields.push(field);
              } else {
                omitted.push({
                  key: field,
                  reason: `invalid field for type ${key}`,
                });
              }
            }
            fields[key] = validFields;
          });
          try {
            query = augmentQueryWithRequiredFields(
              `query ${operationName} ($filter: ${filterTypeName}) {
            ${operationName}(filter: $filter) 
            ${getFields(
              type,
              new Map(Object.entries(fields)),
              dataModelTypes,
              true,
              true
            )}
          }`,
              dataModelTypes
            );
          } catch {
            throw new Error(i18nFn('GQL_ERROR_INVALID_FIELDS'));
          }
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
            'relevant fields and operations',
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
          )
            .then(
              safeConvertToJson<{
                groupBy?: string;
                aggregateProperties: { [key in string]: string[] };
              }>
            )
            .catch(() => {
              throw new Error(i18nFn('GQL_ERROR_INVALID_FIELDS'));
            });

          // validate values
          // TODO extract
          if (
            aggregateFields.groupBy &&
            !typePropertiesForAggregate.some(
              (el) => el.name === aggregateFields.groupBy
            )
          ) {
            throw new Error(
              i18nFn('GQL_ERROR_INVALID_FIELDS_AGGREGATE', {
                type,
                groupBy: aggregateFields.groupBy,
              })
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
                        i18nFn('GQL_ERROR_INVALID_FIELDS_AGGREGATE', {
                          type,
                          groupBy: key,
                        })
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
          if (aggregateFields.groupBy) {
            variables['groupBy'] = [aggregateFields.groupBy];
          }
        }
        return { data: { query } };
      },
    } as ChainStage<QueryOutput, FilterOutput>,
    {
      name: 'retrive results',
      loadingMessage: this.fields.i18nFn('GQL_STAGE_RUNNING_QUERY'),
      run: async (
        { sdk, i18nFn },
        { omitted, query, queryType, variables, type, selectedDataModel }
      ) => {
        const operationName = getOperationName(queryType, type);
        // Get summary
        const queryService = new FdmMixerApiService(sdk);

        try {
          const response = await queryService.runQuery({
            dataModelId: selectedDataModel.externalId,
            schemaVersion: selectedDataModel.version,
            space: selectedDataModel.space,
            graphQlParams: {
              query: query,
              variables,
            },
          });

          const [{ summary }] = await callPromptChain(
            this,
            'summarize filter',
            datamodelResultSummaryPrompt,
            [
              {
                query: JSON.stringify({
                  query: query,
                  variables,
                }),
              },
            ]
          ).then(
            safeConvertToJson<{
              summary: string;
            }>
          );

          // assume no aggregate atm
          const resultAggregate =
            queryType === 'list'
              ? // todo: add support for pagination
                constructListResultSummary(
                  response.data[operationName]['items'].length,
                  response.data[operationName]['pageInfo']?.hasNextPage || false
                )
              : constructAggregateResultSummary(
                  response.data[operationName].items
                );

          sendToCopilotEvent('NEW_MESSAGES', [
            {
              source: 'bot',
              type: 'data-model-query',
              dataModel: {
                externalId: selectedDataModel.externalId,
                version: selectedDataModel.version,
                space: selectedDataModel.space,
                view: type,
                viewVersion:
                  selectedDataModel.views.find((el) => el.externalId === type)
                    ?.version || '',
              },
              content: `${i18nFn('GQL_CHAIN_FOUND_RESULTS', {
                resultAggregate,
              })} ${
                omitted.length > 0
                  ? `${i18nFn('GQL_CHAIN_FAILED_TO_PROCESS_ENTIRE_QUESTION')} `
                  : ''
              }`,
              summary,
              graphql: { query, variables },
              chain: this.constructor.name,
              actions: [],
              logs: getCopilotLogs(this.messageKey),
            },
          ]);
        } catch (e: unknown) {
          console.log(e);
          const response = await queryService.runQuery({
            dataModelId: selectedDataModel.externalId,
            schemaVersion: selectedDataModel.version,
            space: selectedDataModel.space,
            graphQlParams: {
              query: query,
              variables: {},
            },
          });

          const resultAggregate =
            queryType === 'list'
              ? constructListResultSummary(
                  response.data[operationName]['items'].length,
                  response.data[operationName]['pageInfo']?.hasNextPage || false
                )
              : constructAggregateResultSummary(
                  response.data[operationName]['items']
                );

          sendToCopilotEvent('NEW_MESSAGES', [
            {
              source: 'bot',
              type: 'data-model-query',
              dataModel: {
                externalId: selectedDataModel.externalId,
                version: selectedDataModel.version,
                space: selectedDataModel.space,
                view: type,
                viewVersion:
                  selectedDataModel.views.find((el) => el.externalId === type)
                    ?.version || '',
              },
              content: `${i18nFn('GQL_CHAIN_FOUND_RESULTS', {
                resultAggregate,
              })} ${i18nFn('GQL_CHAIN_FAILED_TO_PROCESS_ENTIRE_QUESTION')}`,
              graphql: { query, variables: {} },
              chain: this.constructor.name,
              actions: [],
              logs: getCopilotLogs(this.messageKey),
            },
          ]);
        }

        return {
          data: {},
        };
      },
    } as ChainStage<QueryOutput, {}>,
  ];
}

const getLatestDataModelMessage = (messages: CopilotMessage[] = []) => {
  const dataModelSelectionMsg = [...messages]
    .reverse()
    .find((el) => el.type === 'data-models');
  if (dataModelSelectionMsg && dataModelSelectionMsg.type === 'data-models') {
    return dataModelSelectionMsg.dataModels;
  }
  return [];
};

type DataModelSelectorOutput = {
  selectedDataModels: { dataModel: string; space: string; version: string }[];
};
