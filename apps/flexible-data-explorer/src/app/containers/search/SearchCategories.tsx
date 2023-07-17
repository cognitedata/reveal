import { useParams } from 'react-router-dom';

import styled, { css } from 'styled-components';

import { Body, Chip } from '@cognite/cogs.js';

import { useNavigation } from '../../hooks/useNavigation';
import { useTranslation } from '../../hooks/useTranslation';
import { useFDM } from '../../providers/FDMProvider';
import { useSearchAggregateQuery } from '../../services/dataTypes/queries/useSearchAggregatesQuery';
import { useFilesSearchAggregateCountQuery } from '../../services/instances/file/queries/useFilesSearchAggregateCountQuery';
import { useTimeseriesSearchAggregateCountQuery } from '../../services/instances/timeseries/queries/useTimeseriesSearchAggregateCountQuery';

import { useSearchTotalCount } from './hooks/useSearchTotalCount';

export const SearchCategories = () => {
  const { t } = useTranslation();
  const navigate = useNavigation();

  const { type } = useParams();
  const client = useFDM();

  const { data: genericCount, isLoading: isGenericLoading } =
    useSearchAggregateQuery();
  const { data: fileCount, isLoading: isFilesLoading } =
    useFilesSearchAggregateCountQuery();
  const { data: timeseriesCount, isLoading: isTimeseriesLoading } =
    useTimeseriesSearchAggregateCountQuery();

  const { totalCount, isLoading: isTotalCountLoading } = useSearchTotalCount();

  const isSelected = (name?: string) => type === name;

  const handleSelectionClick = (name?: string) => {
    navigate.toSearchCategoryPage(name);
  };

  if (isGenericLoading || isFilesLoading || isTimeseriesLoading) {
    return null;
  }

  return (
    <Container>
      <Content
        selected={isSelected(undefined)}
        onClick={() => handleSelectionClick(undefined)}
      >
        <NameText>{t('SEARCH_CATEGORIES_ALL_OPTION')}</NameText>
        <Chip
          size="x-small"
          loading={isTotalCountLoading}
          type={isSelected(undefined) ? 'neutral' : undefined}
          label={String(totalCount)}
        />
      </Content>

      {client.allDataTypes?.map((item) => {
        const dataType = item.name;
        const count = genericCount?.[dataType];
        const isDisabled = !count;

        return (
          <Content
            key={dataType}
            selected={isSelected(dataType)}
            disabled={isDisabled}
            onClick={() => !isDisabled && handleSelectionClick(dataType)}
          >
            <NameText>{item.displayName || dataType}</NameText>
            <Chip
              size="x-small"
              type={isSelected(dataType) ? 'neutral' : undefined}
              label={String(count ?? '?')}
            />
          </Content>
        );
      })}

      {/* TODO: Find a better way of managing the built in (CDF) data types */}
      <Content
        selected={isSelected('Timeseries')}
        onClick={() => !!timeseriesCount && handleSelectionClick('Timeseries')}
        disabled={!timeseriesCount}
      >
        <NameText>Time series</NameText>
        <Chip
          size="x-small"
          type={isSelected('Timeseries') ? 'neutral' : undefined}
          label={String(timeseriesCount ?? '?')}
        />
      </Content>

      <Content
        selected={isSelected('Files')}
        onClick={() => !!fileCount && handleSelectionClick('Files')}
        disabled={!fileCount}
      >
        <NameText>File</NameText>
        <Chip
          size="x-small"
          type={isSelected('Files') ? 'neutral' : undefined}
          label={String(fileCount ?? '?')}
        />
      </Content>
    </Container>
  );
};

const Container = styled.div`
  max-width: 200px;
  width: 100%;
  position: sticky;
  top: 0;
`;

const Content = styled.div<{ selected?: boolean; disabled?: boolean }>`
  height: 32;
  border-radius: 8px;
  display: flex;
  align-items: center;
  padding: 8px 12px;
  margin-bottom: 4px;
  cursor: pointer;
  user-selection: none;
  justify-content: space-between;

  &:hover {
    background: rgba(59, 130, 246, 0.08);
  }

  ${({ selected }) =>
    selected &&
    css`
      background: rgba(59, 130, 246, 0.08);

      & > * {
        color: #3b82f6 !important;
        font-weight: 600;
      }
    `}

  ${({ disabled }) =>
    disabled &&
    css`
      user-select: none;
      cursor: not-allowed;

      & > * {
        opacity: 0.5;
      }
    `}
`;

const NameText = styled(Body).attrs({ level: 2 })``;
