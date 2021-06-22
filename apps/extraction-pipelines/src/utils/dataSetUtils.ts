import { DataSet, ListResponse } from '@cognite/sdk';
import { Integration } from 'model/Integration';
import { DataSetMetadata, DataSetModel } from 'model/DataSetModel';
import { DataSetOptions } from 'utils/validation/integrationSchemas';

export interface DataSetFormInput {
  dataset: string;
  dataSetId: string;
}

export const mapUniqueDataSetIds = (integrations?: Integration[]) => {
  return integrations
    ? integrations.reduce((acc: { id: number }[], curr) => {
        if (curr.dataSetId && !acc.find((v) => v.id === curr.dataSetId)) {
          return [...acc, { id: curr.dataSetId }];
        }
        return acc;
      }, [])
    : [];
};

export const mapDataSetToIntegration = (
  integrations?: Integration[],
  dataSets?: DataSetModel[]
) => {
  return integrations
    ? integrations.map((integration) => {
        const dataSetMatch = dataSets?.filter((data: DataSetModel) => {
          return data.id === integration.dataSetId;
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
  dataSetId: number;
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

export const getDataSetPageValues = (
  dataSetId?: string,
  data?: ListResponse<DataSet[]>
): DataSetFormInput => {
  if (!data || !dataSetId) {
    return { dataset: '', dataSetId: '' };
  }
  return hasDataSetId(data.items, dataSetId)
    ? { dataset: DataSetOptions.YES, dataSetId }
    : { dataset: '', dataSetId: '' };
};

const hasDataSetId = (data: DataSet[], dataSetId: string): boolean => {
  return !!data.find(({ id }) => {
    return id === parseInt(dataSetId, 10);
  });
};
