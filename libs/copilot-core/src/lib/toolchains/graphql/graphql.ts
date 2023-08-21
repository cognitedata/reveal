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
    dataModelStage,
    {
      name: 'relevant data type',
      loadingMessage: 'Identifying relevant data...',
      run: async ({ message, sdk }, { selectedDataModels }) => {
        const omitted: { key: string; reason: string }[] = [];
        if (!selectedDataModels) {
          throw new Error(`Data model not speified`);
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
        ).then(safeConvertToJson<Omit<ProcessGraphQLOutput, 'omitted'>>);
        return { data: { omitted, relevantTypes, dataModel, dataModels } };
      },
    } as ChainStage<DataModelSelectorOutput, ProcessGraphQLOutput>,
    {
      name: 'data type processing',
      loadingMessage: 'Processing relevant data...',
      run: async (
        _,
        { relevantTypes, dataModel: dataModelName, dataModels }
      ) => {
        const selectedDataModel =
          dataModels.find(
            (dataModel) =>
              `${dataModel.externalId}_${dataModel.space}` === dataModelName
          ) || dataModels[0];

        if (!selectedDataModel || !selectedDataModel.graphQlDml) {
          throw new Error('No data model selected or invalid data model.');
        }

        const dataModelTypes = new GraphQlUtilsService().parseSchema(
          selectedDataModel.graphQlDml,
          selectedDataModel.views
        );

        const filteredTypes = relevantTypes.filter((el) =>
          dataModelTypes.types.some((type) => type.name === el)
        );

        if (filteredTypes.length === 0) {
          throw new Error('No relevant types found');
        }
        return { data: { filteredTypes, dataModelTypes, selectedDataModel } };
      },
    } as ChainStage<PostProcessGraphQLOutput, ProcessGraphQLOutput>,
    {
      name: 'identify query type',
      loadingMessage: 'Identifying query type...',
      run: async ({ message }, { filteredTypes }) => {
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
        ).then(safeConvertToJson<QueryAndMainTypeOutput>);
        if (
          !['list', 'aggregate'].includes(queryType) ||
          !filteredTypes.includes(type)
        ) {
          throw new Error('Invalid query type or type');
        }
        return { data: { queryType, type } };
      },
    } as ChainStage<QueryAndMainTypeOutput, PostProcessGraphQLOutput>,
    {
      name: 'generating filter',
      loadingMessage: 'Creating filter...',
      run: async (
        { message },
        { filteredTypes, dataModelTypes, relevantTypes, omitted }
      ) => {
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
      },
    } as ChainStage<FilterOutput, QueryAndMainTypeOutput>,
    {
      name: 'creating query',
      loadingMessage: 'Creating query...',
      run: async (
        { message },
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
          ).then(
            safeConvertToJson<{
              [key: string]: string[];
            }>
          );
          // validate values
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
          if (aggregateFields.groupBy) {
            variables['groupBy'] = [aggregateFields.groupBy];
          }
        }
        return { data: { query } };
      },
    } as ChainStage<QueryOutput, FilterOutput>,
    {
      name: 'retrive results',
      loadingMessage: 'Gathering answer...',
      run: async (
        { sdk },
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
                `${response.data[operationName]['items'].length}${
                  response.data[operationName]['pageInfo']?.hasNextPage
                    ? '+'
                    : ''
                }`
              : JSON.stringify(response.data[operationName]['items']);

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
              content: `I found ${resultAggregate} results. ${
                omitted.length > 0
                  ? "I wasn't able to process the entire question. "
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
          const response = await queryService.runQuery({
            dataModelId: selectedDataModel.externalId,
            schemaVersion: selectedDataModel.version,
            space: selectedDataModel.space,
            graphQlParams: {
              query: query,
              variables: {},
            },
          });

          // assume no aggregate atm
          const resultAggregate =
            queryType === 'list'
              ? // todo: add support for pagination
                `${response.data[operationName]['items'].length}+`
              : JSON.stringify(response.data[operationName]['items']);

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
              content: `I found ${resultAggregate} results. I wasn't able to process the entire question. `,
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

const dataModelStage: ChainStage<{}, DataModelSelectorOutput> = {
  name: 'data-model',
  loadingMessage: 'Confirming data model...',
  run: async ({ messages }) => {
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
        content: 'Which data model are you referring to?',
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
};
