import { useEffect, useState, useCallback } from 'react';

import styled from 'styled-components';

import {
  addFromCopilotEventListener,
  sendToCopilotEvent,
  useFromCopilotEventHandler,
} from '@fusion/copilot-core';
import isString from 'lodash/isString';

import { Icon } from '@cognite/cogs.js';
import { useFlag } from '@cognite/react-feature-flags';

import { SearchResults } from '../../../components/search/SearchResults';
import { useNavigation } from '../../../hooks/useNavigation';
import {
  useSearchFilterParams,
  useSearchQueryParams,
} from '../../../hooks/useParams';
import { useFDM } from '../../../providers/FDMProvider';
import { useAIDataTypesQuery } from '../../../services/dataTypes/queries/useAIDataTypesQuery';
import { useSelectedDataModels } from '../../../services/useSelectedDataModels';
import { getIcon } from '../../../utils/getIcon';

export const AIResults = () => {
  const [query] = useSearchQueryParams();
  const [filters] = useSearchFilterParams();
  const selectedDataModels = useSelectedDataModels();
  const navigate = useNavigation();
  const client = useFDM();

  const [gqlQuery, setGQLQuery] = useState('');
  const [variables, setVariables] = useState({});
  const [dataModel, setDataModel] = useState<
    { space: string; externalId: string; version: string } | undefined
  >(undefined);
  const [isAILoading, setIsAILoading] = useState(false);

  const { data = {}, isLoading } = useAIDataTypesQuery(
    dataModel,
    gqlQuery,
    variables
  );

  const { isEnabled: isCopilotEnabled } = useFlag('COGNITE_COPILOT', {
    fallback: false,
  });

  useFromCopilotEventHandler(
    'GQL_QUERY',
    ({
      query: newGqlQuery,
      variables: newVariables,
      dataModel: newDataModel,
    }) => {
      setGQLQuery(newGqlQuery);
      setVariables(newVariables);
      setDataModel(newDataModel);
      setIsAILoading(false);
    }
  );

  useEffect(() => {
    const sendMessage = () => {
      sendToCopilotEvent('NEW_MESSAGES', [
        {
          source: 'bot',
          type: 'data-models',
          dataModels: (selectedDataModels || []).map((model) => ({
            dataModel: model.externalId,
            space: model.space,
            version: model.version,
          })),
          content: 'I am looking at data in this data model',
        },
        {
          source: 'user',
          content: query,
          type: 'text',
          context: 'Searched in Explorer',
        },
      ]);
      setIsAILoading(true);
    };
    if (query && selectedDataModels && isCopilotEnabled) {
      sendMessage();
    }
    const removeHandler = addFromCopilotEventListener('CHAT_READY', () => {
      if (query && selectedDataModels) {
        sendMessage();
      }
      removeHandler();
    });
  }, [query, filters, selectedDataModels, isCopilotEnabled]);

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

  if (!isCopilotEnabled) {
    return <></>;
  }

  if (isLoading || isAILoading) {
    return (
      <Wrapper>
        <Icon type="Loader" />
      </Wrapper>
    );
  }

  return (
    <>
      {Object.values(data).map(({ items }) => {
        return items.map(({ __typename, name, ...item }) => {
          const properties = Object.entries(item).reduce(
            (acc, [key, value]) => {
              if (
                key === 'externalId' ||
                key === 'description' ||
                key === 'space'
              ) {
                return acc;
              }

              if (value !== undefined && isString(value)) {
                return [...acc, { key, value }];
              }

              return acc;
            },
            [] as { key: string; value: string }[]
          );

          return (
            <SearchResults.Item
              key={`${__typename}-${name}`}
              icon={getIcon(__typename)}
              name={__typename}
              description={name}
              properties={properties}
              onClick={() => handleRowClick(item, __typename)}
            />
          );
        });
      })}
    </>
  );
};

const Wrapper = styled.div`
  width: 100%;
  padding: 16px;
  background: mediumpurple;
  margin-bottom: 50px;
`;
