import * as React from 'react';

import { getMapConfigModels } from '../service/getMapConfigModels';
import { getMapConfigSchemas } from '../service/getMapConfigSchemas';
import { getMapConfigSchemaVersions } from '../service/getMapConfigSchemaVersions';
import { getMapConfigSpace } from '../service/getMapConfigSpace';

import { useMissingOrFoundThings } from './useMissingOrFoundThings';

export type Status = {
  spaces: { externalId: string }[];
  models: { externalId: string }[];
  schemas: string[];
  versions: { externalId: string; versions: { version: string }[] }[];
  isLoading: boolean;
};
export const useMapConfigSetupStatus = () => {
  const [data, setData] = React.useState<Status>({
    spaces: [],
    models: [],
    schemas: [],
    versions: [],
    isLoading: true,
  });
  const foundOrMissing = useMissingOrFoundThings(data);

  const runSetupCheck = async () => {
    const spaces = await getMapConfigSpace();
    const models = await getMapConfigModels();
    const schemas = await getMapConfigSchemas();
    const versions = await getMapConfigSchemaVersions();

    setData({
      models,
      spaces,
      schemas,
      versions,
      isLoading: false,
    });
  };

  React.useEffect(() => {
    runSetupCheck();
  }, []);

  return {
    data: { raw: data, ...foundOrMissing },
    isLoading: data.isLoading,
  };
};
