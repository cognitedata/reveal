import {
  DataSetMetadata,
  DataSetModel,
} from '@extraction-pipelines/model/DataSetModel';
import { Extpipe } from '@extraction-pipelines/model/Extpipe';

import { createLink } from '@cognite/cdf-utilities';
import { DataSet } from '@cognite/sdk';

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
