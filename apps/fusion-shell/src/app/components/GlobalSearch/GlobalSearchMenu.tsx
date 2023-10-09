import styled from 'styled-components';

import { Menu } from 'antd';
import noop from 'lodash/noop';

import { createLink } from '@cognite/cdf-utilities';
import { Colors, IconType } from '@cognite/cogs.js';

import { useTranslation } from '../../../i18n';
import { QUERY_RESULT_LIMIT } from '../../utils/constants';
import { useDataCatalogSearchResults } from '../../utils/hooks';
import { trackUsage } from '../../utils/metrics';

import { DatasetMenuGroup } from './DatasetMenuGroup';
import NoSearchResults from './NoSearchResults';
import { ResourcesLabelGroup } from './ResourcesLabelGroup';
import { ResourcesMenuGroup } from './ResourcesMenuGroup';

type GlobalSearchMenuProps = {
  appliedFilters: SearchResourceType[];
  setAppliedFilters: React.Dispatch<React.SetStateAction<SearchResourceType[]>>;
  query: string;
  onClose?: () => void;
};

export type SearchResourceType =
  | 'datasets'
  | 'assets'
  | 'timeseries'
  | 'files'
  | 'events'
  | 'sequences';

export type SearchResourceProps = {
  count: number;
  icon: IconType;
  exploreKey?: string;
  label: string;
  shouldDisplay: boolean;
};

export function GlobalSearchMenu({
  query,
  onClose = noop,
  appliedFilters,
  setAppliedFilters,
}: GlobalSearchMenuProps) {
  const { t } = useTranslation();

  const {
    datasets: { data: datasets = [], isFetched: isDatasetFetched },
    assets: { data: assets = [], isFetched: isAssetsFetched },
    events: { data: events = [], isFetched: isEventsFetched },
    files: { data: files = [], isFetched: isFilesFetched },
    sequences: { data: sequences = [], isFetched: isSequencesFetched },
    timeseries: { data: timeseries = [], isFetched: isTimeseriesFetched },
  } = useDataCatalogSearchResults({
    query,
    limit: QUERY_RESULT_LIMIT,
  });

  const includesFilter = (filter: SearchResourceType) =>
    appliedFilters.includes(filter);

  const shouldDisplayGroup = (filter: SearchResourceType) =>
    includesFilter(filter) || appliedFilters?.length === 0;

  const resources: Record<string, SearchResourceProps> = {
    datasets: {
      count: datasets?.length,
      icon: 'DataSource',
      label: t('datasets'),
      shouldDisplay: shouldDisplayGroup('datasets'),
    },
    assets: {
      count: assets?.length,
      icon: 'Assets',
      exploreKey: 'asset',
      label: t('assets'),
      shouldDisplay: shouldDisplayGroup('assets'),
    },
    events: {
      count: events?.length,
      icon: 'Events',
      exploreKey: 'event',
      label: t('events'),
      shouldDisplay: shouldDisplayGroup('events'),
    },
    files: {
      count: files?.length,
      icon: 'Document',
      exploreKey: 'file',
      label: t('files'),
      shouldDisplay: shouldDisplayGroup('files'),
    },
    sequences: {
      count: sequences?.length,
      icon: 'Sequences',
      exploreKey: 'sequence',
      label: t('sequences'),
      shouldDisplay: shouldDisplayGroup('sequences'),
    },
    timeseries: {
      count: timeseries?.length,
      icon: 'Timeseries',
      exploreKey: 'timeSeries',
      label: t('timeseries'),
      shouldDisplay: shouldDisplayGroup('timeseries'),
    },
  };

  const onToggleFilter = (filter: SearchResourceType) => {
    let filters = [...appliedFilters];
    const hasFilter = includesFilter(filter);

    if (hasFilter) filters = filters.filter((f) => f !== filter);

    if (!hasFilter) filters.push(filter);

    trackUsage({
      e: 'data.catalog.search.filter.click',
      searchText: query,
      filters,
    });
    setAppliedFilters(filters);
  };

  const clearAllSearchFilters = () => {
    setAppliedFilters([]);
  };

  const shouldDisplayNoSearchResults = () => {
    return (
      isDatasetFetched &&
      datasets?.length === 0 &&
      isAssetsFetched &&
      assets?.length === 0 &&
      isEventsFetched &&
      events?.length === 0 &&
      isFilesFetched &&
      files?.length === 0 &&
      isSequencesFetched &&
      sequences?.length === 0 &&
      isTimeseriesFetched &&
      timeseries?.length === 0
    );
  };

  if (!query) return null;

  return (
    <StyledMenuContainer data-testid="global-search-menu">
      <Menu onClick={onClose}>
        <ResourcesLabelGroup
          appliedFilters={appliedFilters}
          onToggleFilter={onToggleFilter}
          onReset={clearAllSearchFilters}
          resources={resources}
        />
        {Object.keys(resources).map((item) => {
          const resourceKey = item as SearchResourceType;
          const resource = resources[resourceKey];
          if (resourceKey === 'datasets' && resource.shouldDisplay)
            return (
              <DatasetMenuGroup
                query={query}
                url={(id) => createLink(`/data-catalog/data-set/${id}`)}
                allUrl="/data-catalog"
                groupLabel={resource.label}
                onClose={onClose}
              />
            );

          if (resource.shouldDisplay) {
            return (
              <ResourcesMenuGroup
                query={query}
                type={resourceKey}
                allUrl={`/explore/search/${resource.exploreKey}`}
                url={(id) =>
                  createLink(`/explore/search/${resource.exploreKey}`, {
                    journey: `${resource.exploreKey}-${id}`,
                  })
                }
                groupLabel={resource.label}
                icon={resource.icon}
                onClose={onClose}
              />
            );
          }
          return null;
        })}
        {shouldDisplayNoSearchResults() && (
          <NoSearchResults searchText={query} />
        )}
      </Menu>
    </StyledMenuContainer>
  );
}

const StyledMenuContainer = styled.div`
  .ant-dropdown-menu {
    width: 700px;
    max-height: 90vh;
    overflow: auto;
    box-shadow: 0 3px 6px -4px rgb(0 0 0 / 12%), 0 6px 16px 0 rgb(0 0 0 / 8%),
      0 9px 28px 8px rgb(0 0 0 / 5%);
    border-radius: 8px;
  }
  .ant-dropdown-menu-item-group {
    color: ${Colors['text-icon--medium']};
  }
  .ant-dropdown-menu-item {
    &:hover {
      background-color: ${Colors['surface--interactive--hover']};
    }
    &.ant-menu-item-selected {
      background-color: ${Colors['surface--interactive--pressed']};
    }
  }
  .ant-dropdown-menu-item-group-title {
    color: inherit;
    font-weight: 500;
    font-size: 13px;
    line-height: 18px;
    letter-spacing: -0.003em;
  }
  .ant-dropdown-menu-title-content {
    color: ${Colors['text-icon--medium']};
    a {
      color: ${Colors['text-icon--medium']};
    }
  }
  :not(:last-child) {
    border-bottom: 1px solid ${Colors['border--interactive--default']};
  }
  .resource-menu-item {
    & span > div > button {
      visibility: hidden;
    }
    &:hover span > div > button {
      visibility: visible;
      height: 28px;
      background: ${Colors['decorative--grayscale--white']};
      border: 1px solid ${Colors['border--muted']};
      border-radius: 4px;
    }
  }
`;
