import { useState, useCallback, useMemo } from 'react';

import { CopilotDataModelQueryMessage } from '@fusion/copilot-core';
import take from 'lodash/take';

import { ButtonShowMore } from '../../../components/buttons/ButtonShowMore';
import { SearchResults } from '../../../components/search/SearchResults';
import { useNavigation } from '../../../hooks/useNavigation';
import { useFDM } from '../../../providers/FDMProvider';
import { SearchResponseItem } from '../../../services/types';
import { extractProperties } from '../../../utils/ai/results';
import { getIcon } from '../../../utils/getIcon';
import { useAICachedResults } from '../hooks/useAICachedResults';
import { PAGE_SIZE } from '../results/constants';

export const AIResultsList = ({
  copilotMessage,
}: {
  copilotMessage?: CopilotDataModelQueryMessage & { edited?: boolean };
}) => {
  const navigate = useNavigation();
  const client = useFDM();

  const [page, setPage] = useState<number>(PAGE_SIZE * 2);

  const results = useAICachedResults(copilotMessage);

  const data = useMemo(() => {
    return take<SearchResponseItem>(results, page);
  }, [results, page]);

  const handleRowClick = useCallback(
    (row: any, dataType: string) => {
      const clickedDataModel = client.getDataModelByDataType(dataType);
      navigate.toInstancePage(dataType, row.space, row.externalId, {
        dataModel: clickedDataModel?.externalId,
        space: clickedDataModel?.space,
        version: clickedDataModel?.version,
      });
    },
    [navigate, client]
  );

  if (data.length === 0 || !data[0].externalId) {
    return null;
  }

  return (
    <>
      {copilotMessage && data.length > 0 && (
        <SearchResults.Body>
          {data.map(({ __typename: dataType, name, title, ...item }) => {
            const properties = extractProperties(item);

            return (
              <SearchResults.Item
                key={`${dataType}-${name}`}
                icon={getIcon(dataType)}
                name={dataType}
                description={name || (title as string) || undefined}
                properties={properties}
                onClick={() => handleRowClick(item, dataType)}
              />
            );
          })}
        </SearchResults.Body>
      )}

      <SearchResults.Footer>
        <ButtonShowMore
          onClick={() => {
            setPage((prevState) => prevState + PAGE_SIZE);
          }}
          hidden={(results?.length || 0) <= page}
        />
      </SearchResults.Footer>
    </>
  );
};
