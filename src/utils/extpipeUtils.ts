import { Extpipe, DataSet } from 'utils/types';
import sdk from '@cognite/cdf-sdk-singleton';

const EXTRACTION_PIPELINE_PATH: Readonly<string> = 'extpipes';

export const mapDataSetExtpipe = (
  dataSets: DataSet[],
  allExtpipes: Extpipe[]
) =>
  dataSets.map((dataSet) => ({
    dataSet,
    extpipes: allExtpipes.filter(
      (extpipe) => dataSet.id === integration.dataSetId
    ),
  }));

export const getExtractionPipelineApiUrl = (project: string) => {
  return `/api/v1/projects/${project}/${EXTRACTION_PIPELINE_PATH}`;
};
export const getExtractionPipelineUIUrl = (path?: string) => {
  return `/${EXTRACTION_PIPELINE_PATH}${path}`;
};

export const fetchIntegrationsByDataSetId = async (id: number) => {
  let integrations;
  try {
    integrations = await sdk.get(getExtractionPipelineApiUrl(sdk.project), {
      withCredentials: true,
    });
  } catch {
    integrations = {};
  }

  return (
    integrations?.data?.items?.filter(
      ({ dataSetId }: { dataSetId: number }) => {
        return dataSetId === id;
      }
    ) || []
  );
};
