import { useState, useRef, useMemo } from 'react';

import {
  useCurrentLinkedView,
  useModelInstancesSearch,
} from '@fusion/contextualization';
import { debounce } from 'lodash';

import { MatchInputOption, ModelInstance } from '../types';

export const useSearchMatchInputOptions = () => {
  const debounceTimeout = 800;
  const [searching, setSearching] = useState(false);
  const [options, setOptions] = useState<MatchInputOption[]>([]);
  // A reference to track the latest fetch operation.
  const fetchRef = useRef(0);

  const { mutateAsync } = useModelInstancesSearch();

  const linkedView = useCurrentLinkedView();

  const debounceFetcher = useMemo(() => {
    const loadOptions = async (value: string) => {
      fetchRef.current += 1;
      const fetchId = fetchRef.current;
      setOptions([]);
      setSearching(true);

      const query = value; // Use the user's input as the query
      const space = linkedView?.space;
      const externalId = linkedView?.externalId;
      const version = linkedView?.version;

      try {
        const response = await mutateAsync({
          space,
          type: externalId,
          version,
          query,
        });

        if (fetchId !== fetchRef.current) {
          // Skip if not the latest fetch response
          return;
        }

        const newOptions = response?.items.map((instance: ModelInstance) => ({
          label: instance.externalId, // Adjust based on the structure of the instance
          value: instance.externalId, // Adjust based on the structure of the instance
        }));

        setOptions(newOptions); // Set the fetched options
        setSearching(false);
      } catch (error) {
        // Handle error here
        console.error(error);
        setSearching(false);
      }
    };

    return debounce(loadOptions, debounceTimeout);
  }, [
    debounceTimeout,
    linkedView?.space,
    linkedView?.externalId,
    linkedView?.version,
    mutateAsync,
  ]);

  return {
    matchInputOptionsFetcher: debounceFetcher,
    matchInputOptions: options,
    searching,
  };
};
