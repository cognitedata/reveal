import { useState, useCallback, useMemo } from 'react';

import { CopilotDataModelQueryMessage } from '@fusion/copilot-core';
import take from 'lodash/take';

import { ButtonShowMore } from '../../../components/buttons/ButtonShowMore';
import { SearchResults } from '../../../components/search/SearchResults';
import { useNavigation } from '../../../hooks/useNavigation';
import { useFDM } from '../../../providers/FDMProvider';
import { SearchResponseItem } from '../../../services/types';
import { getIcon } from '../../../utils/getIcon';
import { InstancePreview } from '../../preview/InstancePreview';
import { useAICachedResults } from '../hooks/useAICachedResults';
import { PAGE_SIZE } from '../results/constants';
import { extractProperties } from '../utils';

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
              <InstancePreview.Generic
                key={item.externalId}
                dataModel={copilotMessage.dataModel}
                instance={{
                  dataType,
                  instanceSpace: item.space as string,
                  externalId: item.externalId,
                }}
              >
                <SearchResults.Item
                  key={`${dataType}-${name}`}
                  icon={getIcon(dataType)}
                  name={dataType}
                  description={name || (title as string) || undefined}
                  properties={properties}
                  onClick={() => handleRowClick(item, dataType)}
                />
              </InstancePreview.Generic>
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
