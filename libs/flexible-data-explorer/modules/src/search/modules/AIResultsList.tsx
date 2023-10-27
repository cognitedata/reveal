import { useState, useMemo } from 'react';

import { Button, Link, SearchResults } from '@fdx/components';
import { useFDM } from '@fdx/shared/providers/FDMProvider';
import { SearchResponseItem } from '@fdx/shared/types/services';
import { getIcon } from '@fdx/shared/utils/getIcon';
import { CopilotDataModelQueryResponse } from '@fusion/copilot-core';
import take from 'lodash/take';

import { InstancePreview } from '../../preview/InstancePreview';
import { useAICachedResults } from '../hooks/useAICachedResults';
import { PAGE_SIZE } from '../results/constants';
import { extractProperties } from '../utils';

export const AIResultsList = ({
  copilotMessage,
}: {
  copilotMessage?: CopilotDataModelQueryResponse & { edited?: boolean };
}) => {
  const client = useFDM();

  const [page, setPage] = useState<number>(PAGE_SIZE * 2);

  const results = useAICachedResults(copilotMessage);

  const data = useMemo(() => {
    return take<SearchResponseItem>(results, page);
  }, [results, page]);

  if (data.length === 0 || !data[0].externalId) {
    return null;
  }

  return (
    <>
      {copilotMessage && data.length > 0 && (
        <SearchResults.Body>
          {data.map(({ __typename: dataType, name, title, ...item }) => {
            const properties = extractProperties(item);

            const dataModel = client.getDataModelByDataType(dataType);
            const instance = {
              dataType,
              instanceSpace: item.space,
              externalId: item.externalId,
            };

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
                <Link.GenericPage instance={instance} dataModel={dataModel}>
                  <SearchResults.Item
                    key={`${dataType}-${name}`}
                    icon={getIcon(dataType)}
                    name={dataType}
                    description={name || (title as string) || undefined}
                    properties={properties}
                  />
                </Link.GenericPage>
              </InstancePreview.Generic>
            );
          })}
        </SearchResults.Body>
      )}

      <SearchResults.Footer>
        <Button.ShowMore
          onClick={() => {
            setPage((prevState) => prevState + PAGE_SIZE);
          }}
          hidden={(results?.length || 0) <= page || !copilotMessage}
        />
      </SearchResults.Footer>
    </>
  );
};
