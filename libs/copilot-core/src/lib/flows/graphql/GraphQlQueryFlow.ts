import {
  FdmMixerApiService,
  GraphQlDmlVersionDTO,
} from '@platypus/platypus-core';
import noop from 'lodash/noop';

import { GraphQLQueryChain } from '@cognite/llm-hub';
import { CogniteClient } from '@cognite/sdk';

import { Flow } from '../../CogniteBaseFlow';
import { CopilotDataModelQueryResponse } from '../../types';

export type GraphQlQueryFlowInput = {
  prompt: string;
  sdk: CogniteClient;
  selectedDataModels: { dataModel: string; space: string; version: string }[];
  onStatus?: (step: string, progress?: number) => void;
};
export class GraphQlQueryFlow extends Flow<
  GraphQlQueryFlowInput,
  CopilotDataModelQueryResponse
> {
  label = 'Find data';
  description = 'Find data from data model';

  run: Flow<GraphQlQueryFlowInput, CopilotDataModelQueryResponse>['run'] =
    async ({ prompt, sdk, selectedDataModels }) => {
      const service = new FdmMixerApiService(sdk);

      const dataModels = (
        await Promise.all(
          selectedDataModels.map(async ({ dataModel, space, version }) => {
            const versions = await service.getDataModelVersionsById(
              space,
              dataModel
            );
            return versions.find(
              (el) => String(el.version) === String(version)
            );
          })
        )
      ).filter((el) => el !== undefined) as GraphQlDmlVersionDTO[];

      const {
        query,
        variables,
        selectedDataModel,
        summary,
        type,
        queryType,
        relevantTypes,
      } = await GraphQLQueryChain.run({
        dataModels: dataModels.map((el) => ({
          dataModel: el.externalId,
          space: el.space,
          version: el.version,
          dml: el.graphQlDml || '',
        })),
        message: prompt,
        sdk,
        callback: this.fields.onStatus
          ? { onStepStart: this.fields.onStatus, onStepEnd: noop }
          : undefined,
      });

      return {
        source: 'bot',
        type: 'data-model-query',
        dataModel: {
          ...selectedDataModel,
          externalId: selectedDataModel.dataModel,
          view: type,
          viewVersion:
            dataModels
              .find(
                (el) =>
                  el.externalId === selectedDataModel.dataModel &&
                  el.space === selectedDataModel.space &&
                  el.version === selectedDataModel.version
              )
              ?.views.find((el) => el.externalId === type)?.version ||
            selectedDataModel.version,
        },
        content: '',
        summary: summary,
        queryType,
        relevantTypes,
        dataType: type,
        graphql: {
          query,
          variables,
        },
      };
    };

  chatRun: Flow<
    GraphQlQueryFlowInput,
    CopilotDataModelQueryResponse
  >['chatRun'] = async (sendResponse, sendStatus) => {
    if (!this.fields.onStatus) {
      this.fields.onStatus = (_, progress) => {
        if (progress) {
          if (progress < 0.3) {
            sendStatus({
              status: 'Identifying correct data...',
              stage: progress,
            });
          } else if (progress < 0.6) {
            sendStatus({
              status: 'Identifying correct filter...',
              stage: progress,
            });
          } else if (progress < 0.9) {
            sendStatus({ status: 'Summarizing results...', stage: progress });
          } else {
            sendStatus({ status: 'Finishing up...', stage: progress });
          }
        }
      };
    }
    if (this.fields?.selectedDataModels === undefined) {
      return {
        text: 'Please provide a data model',
        type: 'data-model',
        onNext: (dataModels) => {
          this.fields.selectedDataModels = dataModels.dataModels;
        },
      };
    }
    if (this.fields?.prompt === undefined) {
      return {
        text: 'Describe the data you want to find',
        type: 'text',
        onNext: ({ content }) => {
          this.fields.prompt = content;
        },
      };
    }
    sendStatus({ status: 'Analyzing data...', stage: 0 });
    sendResponse(await this.run(this.fields as GraphQlQueryFlowInput));
    this.fields.prompt = undefined;
    return undefined;
  };
}
