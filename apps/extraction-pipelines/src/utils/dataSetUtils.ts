import { DataSet } from '@cognite/sdk';
import { Integration } from '../model/Integration';

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
  dataSets?: DataSet[]
) => {
  return integrations
    ? integrations.map((integration) => {
        const dataSetMatch = dataSets?.filter((data: DataSet) => {
          return data.id === parseInt(integration.dataSetId, 10);
        });
        return {
          ...integration,
          dataSet: dataSetMatch ? dataSetMatch[0] : undefined,
        };
      })
    : [];
};
