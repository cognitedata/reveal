import { useEffect, useState } from 'react';
import { useDataTransfersState } from 'contexts/DataTransfersContext';
import { RESTTransfersFilter } from 'typings/interfaces';
import { useDataTransfersQuery } from 'services/endpoints/datatransfers/query';
import isEmpty from 'lodash/isEmpty';

export function usePrepareDataTransfersQuery() {
  const [options, setOptions] = useState<RESTTransfersFilter>({});

  const { data: datatransfers, ...rest } = useDataTransfersQuery({
    enabled: !isEmpty(options),
    options,
  });

  const {
    filters: { selectedConfiguration },
  } = useDataTransfersState();

  useEffect(() => {
    const isFiltersSelected = selectedConfiguration;

    if (isFiltersSelected) {
      const buildOptions: RESTTransfersFilter = {};

      if (selectedConfiguration) {
        buildOptions.configuration = selectedConfiguration.name;
      }

      setOptions(buildOptions);
    }
  }, [selectedConfiguration]);

  return { data: datatransfers, ...rest };
}
