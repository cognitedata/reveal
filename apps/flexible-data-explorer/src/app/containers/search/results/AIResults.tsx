import { useEffect, useState, useCallback, useMemo } from 'react';

import styled from 'styled-components';

import {
  CopilotActions,
  CopilotDataModelQueryMessage,
  addFromCopilotEventListener,
  sendToCopilotEvent,
  useToCopilotEventHandler,
  CopilotPurpleOverride,
} from '@fusion/copilot-core';
import isNumber from 'lodash/isNumber';
import isString from 'lodash/isString';
import take from 'lodash/take';
import pluralize from 'pluralize';

import { Body, Button, Flex, NotificationDot } from '@cognite/cogs.js';

import { ButtonShowMore } from '../../../components/buttons/ButtonShowMore';
import { SearchResults } from '../../../components/search/SearchResults';
import { useIsCopilotEnabled } from '../../../hooks/useFlag';
import { useAIQueryLocalStorage } from '../../../hooks/useLocalStorage';
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
import { CogPilotIcon } from '../components/CogPilotIcon';
import { AIFilterBuilder } from '../containers/AIFilterBuilder/AIFilterBuilder';

import { PAGE_SIZE } from './constants';

export const AIResults = () => {
  const { t } = useTranslation();
  const [query] = useSearchQueryParams();
  const [filters] = useSearchFilterParams();
  const selectedDataModels = useSelectedDataModels();
  const navigate = useNavigation();
  const client = useFDM();
  const [aiSearchEnabled] = useAISearchParams();

  const [page, setPage] = useState<number>(PAGE_SIZE * 2);
  const [isFilterBuilderVisible, setFilterBuilderVisible] = useState(false);
  const [copilotMessage, setMessage] = useState<
    (CopilotDataModelQueryMessage & { edited?: boolean }) | undefined
  >(undefined);
  const [loadingProgress, setLoadingProgress] = useState<
    | {
        stage?: number;
        status: string;
      }
    | undefined
  >(undefined);

  const { data: results, isLoading } = useAIDataTypesQuery(
    query,
    selectedDataModels || [],
    copilotMessage
  );
  const [cachedQuery] = useAIQueryLocalStorage();

  useEffect(() => {
    if (cachedQuery) {
      setMessage((currMessage) => currMessage || cachedQuery.message);
    }
  }, [cachedQuery]);

  const cachedResults = useMemo(() => {
    if (results) {
      return results;
    }
    if (
      cachedQuery?.search === query &&
      JSON.stringify(
        cachedQuery.dataModels.map(
          (el) => `${el.externalId}_${el.version}_${el.space}`
        )
      ) ===
        JSON.stringify(
          (selectedDataModels || []).map(
            (el) => `${el.externalId}_${el.version}_${el.space}`
          )
        ) &&
      JSON.stringify(cachedQuery.message.graphql.variables['filter']) ===
        JSON.stringify(copilotMessage?.graphql.variables['filter'])
    ) {
      return cachedQuery.results;
    }
    return undefined;
  }, [cachedQuery, results, selectedDataModels, query, copilotMessage]);

  const normalizedValues: any[] = useMemo(() => {
    return recursiveConcatItems(cachedResults);
  }, [cachedResults]);

  const data = useMemo(() => {
    return take<SearchResponseItem>(normalizedValues, page);
  }, [normalizedValues, page]);

  const isCopilotEnabled = useIsCopilotEnabled();

  useToCopilotEventHandler('NEW_MESSAGES', (messages) => {
    for (const message of messages) {
      if (message.type === 'data-model-query') {
        setMessage(message);
        setLoadingProgress(undefined);
      }
    }
  });

  useToCopilotEventHandler('LOADING_STATUS', (status) => {
    setLoadingProgress(status);
  });

  useEffect(() => {
    const sendMessage = () => {
      if (cachedQuery?.search !== query) {
        setMessage(undefined);
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
        setLoadingProgress({ stage: 0, status: t('AI_LOADING_SEARCH') });
      }
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
  }, [
    query,
    filters,
    selectedDataModels,
    isCopilotEnabled,
    aiSearchEnabled,
    cachedQuery,
    t,
  ]);

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

  const resultText = useMemo(() => {
    let text = '';
    if (data.length === 0) {
      text += t('AI_SEARCH_RESULTS_EMPTY', {
        type: pluralize(copilotMessage?.dataModel.view.toLowerCase() || ''),
      });
    } else {
      text += copilotMessage?.content;
      if (!copilotMessage?.edited) {
        text += t('AI_SEARCH_RESULTS_GENERATED_DISCLAIMER');
      }
    }
    return text;
  }, [data, t, copilotMessage]);

  if (!aiSearchEnabled || !isCopilotEnabled) {
    return null;
  }

  if ((cachedResults === undefined && isLoading) || loadingProgress) {
    return (
      <Header $loading>
        <Flex gap={8} alignItems="center" style={{ width: '100%' }}>
          <CogPilotIcon />
          <Body strong inverted size="medium">
            {t('AI_LOADING_TEXT', {
              status: loadingProgress?.status || t('AI_LOADING_SEARCH'),
            })}
          </Body>
        </Flex>
        <Loader
          $progress={`${Math.floor((loadingProgress?.stage || 0) * 100)}%`}
        />
      </Header>
    );
  }

  return (
    <Wrapper>
      <SearchResults key="ai-results">
        <Header>
          <CogPilotIcon />
          <Flex direction="column" gap={8} style={{ width: '100%' }}>
            <Body size="medium" inverted strong>
              {resultText}
            </Body>
            <Flex alignItems="center">
              <Body size="medium" muted inverted style={{ flex: 1 }}>
                {t('AI_FILTER_APPLIED', { filter: query })}
              </Body>
              <NotificationDot hidden={!copilotMessage?.edited}>
                <Button
                  size="small"
                  inverted
                  icon="Filter"
                  onClick={() => {
                    setFilterBuilderVisible(true);
                  }}
                >
                  {t('AI_INSPECT_FILTER')}
                </Button>
              </NotificationDot>
            </Flex>
          </Flex>
        </Header>
        {copilotMessage && <CopilotActions message={copilotMessage} />}

        {data.length > 0 && (
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
                  if (value !== undefined && isNumber(value)) {
                    return [...acc, { key, value: `${value}` }];
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
        )}

        <SearchResults.Footer>
          <ButtonShowMore
            onClick={() => {
              setPage((prevState) => prevState + PAGE_SIZE);
            }}
            hidden={normalizedValues.length <= page}
          />
        </SearchResults.Footer>
      </SearchResults>
      {copilotMessage && (
        <AIFilterBuilder
          visible={isFilterBuilderVisible}
          space={copilotMessage.dataModel.space}
          dataModelExternalId={copilotMessage.dataModel.externalId}
          type={copilotMessage.dataModel.view}
          version={copilotMessage.dataModel.version}
          initialFilter={copilotMessage.graphql.variables.filter}
          onOk={(newFilter) => {
            setMessage({
              ...copilotMessage,
              graphql: {
                ...copilotMessage.graphql,
                variables: {
                  ...copilotMessage.graphql.variables,
                  filter: newFilter,
                },
              },
              edited: true,
            });
            setFilterBuilderVisible(false);
          }}
          onCancel={() => {
            setFilterBuilderVisible(false);
          }}
        />
      )}
    </Wrapper>
  );
};

const Header = styled.div<{ $loading?: boolean }>`
  display: flex;
  padding: 16px;
  gap: 8px;
  border-radius: 8px;
  background: ${(props) =>
    props.$loading
      ? `var(--text-icon-ai-muted, rgba(96, 42, 207, 0.65));`
      : `radial-gradient(
    190.15% 190.15% at -12.5% 12.5%,
    #8b5cf6 0%,
    #5e28d9 100%
  )`};
  box-shadow: 0px 3px 4px 0px rgba(24, 24, 28, 0.03),
    0px 1px 2px 0px rgba(24, 24, 28, 0.04);
  color: #fff;
  font-size: 14px;
  margin-bottom: 16px;
  transition: 0.3s all;
  position: relative;
`;

const Loader = styled.div<{ $progress: string }>`
  display: flex;
  position: absolute;
  transition: 0.3s all;
  height: 100%;
  width: 100%;
  border-radius: 8px;
  left: 0;
  top: 0;
  width: ${(props) => props.$progress};
  background: radial-gradient(
    190.15% 190.15% at -12.5% 12.5%,
    #8b5cf6 0%,
    #5e28d9 100%
  );
  box-shadow: 0px 3px 4px 0px rgba(24, 24, 28, 0.03),
    0px 1px 2px 0px rgba(24, 24, 28, 0.04);
  color: #fff;
  z-index: -1;
`;

const Wrapper = styled.div`
  ${CopilotPurpleOverride}

  && > div {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .actions {
    margin-bottom: 12px;
  }
`;

const recursiveConcatItems = (data?: any) => {
  return Object.values(data || []).flatMap(({ items }: any) =>
    items.concat(
      items
        .map((el: any) =>
          Object.values(el)
            .filter(
              (val: any) => val && typeof val === 'object' && 'items' in val
            )
            .map((val: any) => recursiveConcatItems({ val }))
            .flat()
        )
        .flat()
    )
  );
};
