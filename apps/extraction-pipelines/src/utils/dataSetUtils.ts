import { DataSet } from '@cognite/sdk';
import { Extpipe } from 'model/Extpipe';
import { DataSetMetadata, DataSetModel } from 'model/DataSetModel';
import { createLink } from '@cognite/cdf-utilities';

export const mapUniqueDataSetIds = (extpipes?: Extpipe[]) => {
  return extpipes
    ? extpipes.reduce((acc: { id: number }[], curr) => {
        if (curr.dataSetId && !acc.find((v) => v.id === curr.dataSetId)) {
          return [...acc, { id: curr.dataSetId }];
        }
        return acc;
      }, [])
    : [];
};

export const mapDataSetToExtpipe = (
  extpipes?: Extpipe[],
  dataSets?: DataSetModel[]
) => {
  return extpipes
    ? extpipes.map((extpipe) => {
        const dataSetMatch = dataSets?.filter((data: DataSetModel) => {
          return data.id === extpipe.dataSetId;
        });
        return {
          ...extpipe,
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

export const getDataSetsLink = (dataSetId: number) => {
  return createLink(`/data-sets/data-set/${dataSetId}`);
};
