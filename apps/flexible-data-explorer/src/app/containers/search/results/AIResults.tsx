import { useEffect, useState, useCallback, useMemo } from 'react';

import styled from 'styled-components';

// eslint-disable-next-line @nx/enforce-module-boundaries
import {
  addFromCopilotEventListener,
  sendToCopilotEvent,
  useToCopilotEventHandler,
} from '@fusion/copilot-core';
import isEmpty from 'lodash/isEmpty';
import isString from 'lodash/isString';
import take from 'lodash/take';

import { Icon } from '@cognite/cogs.js';

import { ButtonShowMore } from '../../../components/buttons/ButtonShowMore';
import { SearchResults } from '../../../components/search/SearchResults';
import { useIsCopilotEnabled } from '../../../hooks/useFlag';
import { useNavigation } from '../../../hooks/useNavigation';
import {
  useAISearchParams,
  useSearchFilterParams,
  useSearchQueryParams,
} from '../../../hooks/useParams';
import { useTranslation } from '../../../hooks/useTranslation';
import { useFDM } from '../../../providers/FDMProvider';
import { useAIDataTypesQuery } from '../../../services/dataTypes/queries/useAIDataTypesQuery';
import { SearchResponseItem } from '../../../services/types';
import { useSelectedDataModels } from '../../../services/useSelectedDataModels';
import { getIcon } from '../../../utils/getIcon';
import { getCountsString } from '../../../utils/string';
import { CogPilotIcon } from '../components/CogPilotIcon';
import { useAiResultsCounts } from '../hooks/useAiResultsCounts';

import { PAGE_SIZE } from './constants';

export const AIResults = () => {
  const { t } = useTranslation();
  const [query] = useSearchQueryParams();
  const [filters] = useSearchFilterParams();
  const selectedDataModels = useSelectedDataModels();
  const navigate = useNavigation();
  const client = useFDM();
  const [aiSearchEnabled] = useAISearchParams();

  const [gqlQuery, setGQLQuery] = useState('');
  const [variables, setVariables] = useState({});
  const [dataModel, setDataModel] = useState<
    { space: string; externalId: string; version: string } | undefined
  >(undefined);
  const [isAILoading, setIsAILoading] = useState(false);
  const [page, setPage] = useState<number>(PAGE_SIZE);

  const { data: results = {}, isLoading } = useAIDataTypesQuery(
    dataModel,
    gqlQuery,
    variables
  );

  const normalizedValues = useMemo(() => {
    return Object.values(results).flatMap(({ items }) => items);
  }, [results]);

  const data = useMemo(() => {
    return take<SearchResponseItem>(normalizedValues, page);
  }, [normalizedValues, page]);

  const counts = useAiResultsCounts(results);

  const isCopilotEnabled = useIsCopilotEnabled();

  useToCopilotEventHandler('NEW_MESSAGES', (messages) => {
    for (const message of messages) {
      if (message.type === 'data-model-query') {
        const {
          graphql: { query: newGqlQuery, variables: newVariables },
          dataModel: newDataModel,
        } = message;
        setGQLQuery(newGqlQuery);
        setVariables(newVariables);
        setDataModel(newDataModel);
        setIsAILoading(false);
      }
    }
  });

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
    if (aiSearchEnabled && query && selectedDataModels && isCopilotEnabled) {
      sendMessage();
    }
    const removeHandler = addFromCopilotEventListener('CHAT_READY', () => {
      if (query && selectedDataModels) {
        sendMessage();
      }
      removeHandler();
    });
  }, [query, filters, selectedDataModels, isCopilotEnabled, aiSearchEnabled]);

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

  if (!aiSearchEnabled || !isCopilotEnabled) {
    return null;
  }

  if (isLoading || isAILoading) {
    return (
      <Header>
        <Icon type="Loader" />
      </Header>
    );
  }

  return (
    <SearchResults key="ai-results" empty={isEmpty(normalizedValues)}>
      <Header>
        <CogPilotIcon />
        <span>
          {t('AI_SEARCH_RESULTS_HEADER', {
            counts: getCountsString(counts, t),
          })}
        </span>
      </Header>

      <SearchResults.Body>
        {data.map(({ __typename: dataType, name, ...item }) => {
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
              key={`${dataType}-${name}`}
              icon={getIcon(dataType)}
              name={dataType}
              description={name}
              properties={properties}
              onClick={() => handleRowClick(item, dataType)}
            />
          );
        })}
      </SearchResults.Body>

      <SearchResults.Footer>
        <ButtonShowMore
          onClick={() => {
            setPage((prevState) => prevState + PAGE_SIZE);
          }}
          hidden={normalizedValues.length <= page}
        />
      </SearchResults.Footer>
    </SearchResults>
  );
};

const Header = styled.div`
  display: flex;
  padding: 16px;
  gap: 8px;
  border-radius: 8px;
  background: radial-gradient(
    190.15% 190.15% at -12.5% 12.5%,
    #8b5cf6 0%,
    #5e28d9 100%
  );
  box-shadow: 0px 3px 4px 0px rgba(24, 24, 28, 0.03),
    0px 1px 2px 0px rgba(24, 24, 28, 0.04);
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 16px;
`;
