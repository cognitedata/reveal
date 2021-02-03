import { DataSet } from '@cognite/sdk';
import { Integration } from '../model/Integration';
import { DataSetMetadata, DataSetModel } from '../model/DataSetModel';

export const mapUniqueDataSetIds = (integrations?: Integration[]) => {
  return integrations
    ? integrations
        .map((integration) => {
          const id = parseInt(integration.dataSetId, 10);
          return { id };
        })
        .filter((v, i, a) => a.findIndex((t) => t.id === v.id) === i)
    : [];
};

export const mapDataSetToIntegration = (
  integrations?: Integration[],
  dataSets?: DataSetModel[]
) => {
  return integrations
    ? integrations.map((integration) => {
        const dataSetMatch = dataSets?.filter((data: DataSetModel) => {
          return data.id === parseInt(integration.dataSetId, 10);
        });
        return {
          ...integration,
          dataSet: dataSetMatch ? dataSetMatch[0] : undefined,
        };
      })
    : [];
};
export const parseDataSetMeta = (metadata: object): DataSetMetadata => {
  return Object.entries(metadata).reduce((acc, [k, v]) => {
    try {
      const json = JSON.parse(v);
      return { ...acc, [k]: json };
    } catch (_) {
      return { ...acc, [k]: v };
    }
  }, {});
};
export const mapDataSetResponse = (response: DataSet[]): DataSetModel[] => {
  return response.map((r: DataSet) => {
    if (r.metadata) {
      const meta = parseDataSetMeta(r.metadata);
      return { ...r, metadata: meta } as DataSetModel;
    }
    return r as DataSetModel;
  });
};

interface GetDataSetLinkProps {
  origin: string | undefined;
  project: string | null;
  dataSetId: string;
  cdfEnv: string | undefined;
}

export const getDataSetsLink = ({
  origin,
  project,
  cdfEnv,
  dataSetId,
}: GetDataSetLinkProps) => {
  return `${origin}/${project}/data-sets/data-set/${dataSetId}${
    cdfEnv ? `?env=${cdfEnv}` : ''
  }`;
};
