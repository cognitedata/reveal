import { useParams } from 'react-router-dom';

import { useSelectedDataModelVersion } from '../../../../hooks/useSelectedDataModelVersion';

/**
 * Returns details of the current data model.
 * Data model is selected based on available URL params.
 */
export function useDataModel() {
  const { dataModelExternalId, space, version } = useParams() as {
    dataModelExternalId: string;
    space: string;
    version: string;
  };

  const { dataModelVersion, ...rest } = useSelectedDataModelVersion(
    version,
    dataModelExternalId,
    space
  );

  return { dataModel: dataModelVersion, ...rest };
}
