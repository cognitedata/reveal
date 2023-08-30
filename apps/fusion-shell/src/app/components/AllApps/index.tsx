import { useState } from 'react';

import styled from 'styled-components';

import debounce from 'lodash/debounce';
import flatMap from 'lodash/flatMap';
import uniq from 'lodash/uniq';

import { Colors, Flex, Input } from '@cognite/cogs.js';
import { useFlag } from '@cognite/react-feature-flags';

import { useTranslation } from '../../../i18n';
import { useSections } from '../../sections';
import { useFeatureToggledItems } from '../../utils/hooks';
import { trackUsage } from '../../utils/metrics';

import Applications from './Applications';
import Categories from './Categories';
import PageHeader from './Header';
import StyledLayout from './Layout';
import { CategoryId, ItemWithSection } from './types';

const searchItems = (items: ItemWithSection[], query: string) =>
  query
    ? items.filter(
        (it) =>
          it.title.toLocaleLowerCase().includes(query.toLocaleLowerCase()) ||
          it.subtitle
            .toLocaleLowerCase()
            ?.includes(query.toLocaleLowerCase()) ||
          it.tagname?.toLocaleLowerCase()?.includes(query.toLocaleLowerCase())
      )
    : items;

const filterItems = (items: ItemWithSection[], filter: CategoryId) =>
  filter === 'All' ? items : items.filter((it) => it.section === filter);

const AllApps = () => {
  const { t } = useTranslation();
  const [category, setCategory] = useState<CategoryId>('All');
  const [query, setQuery] = useState<string>('');

  const { sections } = useSections();

  // Feature toggle used for CDF development purposes
  // that enables all sub-apps in CDF UI
  const { isEnabled: shouldEnableAllApps } = useFlag('CDF_ALL_FEATURES');

  const allItems: ItemWithSection[] = flatMap(sections, (s) => {
    return s.items.map((item) => ({
      ...item,
      section: s.internalId,
      colors: s.colors,
    }));
  });
  const itemsEnabled = useFeatureToggledItems(allItems);

  const items = shouldEnableAllApps ? [...allItems] : [...itemsEnabled];
  const sectionNames = uniq(items.map((it) => it.section));

  return (
    <Flex direction="column">
      <PageHeader />
      <StyledLayout>
        <StyledContentLayout direction="column">
          <StyledSearchInput
            size="large"
            fullWidth
            placeholder={t('search-for-cdf-tool')}
            value={query}
            onChange={(e) => {
              const searchQuery = e.currentTarget.value;
              debounce(
                () =>
                  trackUsage({
                    e: 'Navigation.AllApps.Search.Click',
                    searchText: searchQuery,
                  }),
                1000
              );
              setQuery(searchQuery);
            }}
          />
          <Flex gap={40}>
            <Categories
              items={searchItems(items, query)}
              onChange={setCategory}
              selected={category}
              sections={sectionNames}
            />
            <Applications
              items={filterItems(searchItems(items, query), category)}
              query={query}
            />
          </Flex>
        </StyledContentLayout>
      </StyledLayout>
    </Flex>
  );
};

const StyledSearchInput = styled(Input).attrs({
  type: 'search',
  icon: 'Search',
})`
  svg {
    color: ${Colors['text-icon--muted']};

    path {
      fill: currentColor;
    }
  }
`;

const StyledContentLayout = styled(Flex)`
  gap: 20px;
  padding: 20px 0;

  @media (min-width: 600px) {
    width: 100%;
  }

  @media (min-width: 1240px) {
    width: 100%;
  }

  @media (min-width: 1440px) {
    width: 1128px;
  }
`;

export default AllApps;
