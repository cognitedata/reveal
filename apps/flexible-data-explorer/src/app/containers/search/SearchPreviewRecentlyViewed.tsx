import React from 'react';

import { EmptyState } from '../../components/EmptyState';
import { DASH } from '../../constants/common';
import { useNavigation } from '../../hooks/useNavigation';
import {
  RecentlyViewed,
  useRecentlyVisited,
} from '../../hooks/useRecentlyVisited';
import { useTranslation } from '../../hooks/useTranslation';

import { SearchList } from './components/SearchList';

interface Props {
  onSelectionClick?: () => void;
}

export const SearchPreviewRecentlyViewed: React.FC<Props> = ({
  onSelectionClick,
}) => {
  const { t } = useTranslation();
  const { toInstancePage } = useNavigation();
  const [recentlyViewed] = useRecentlyVisited();

  const handleItemClick = (item: RecentlyViewed) => {
    toInstancePage(
      item.instance.dataType,
      item.instance.space,
      item.instance.externalId,
      {
        dataModel: item.dataModel.externalId,
        space: item.dataModel.space,
        version: item.dataModel.version,
      }
    );

    onSelectionClick?.();
  };

  if (recentlyViewed.length === 0) {
    return (
      <EmptyState
        title={t('RECENTLY_VIEWED_EMPTY_TITLE')}
        body={t('RECENTLY_VIEWED_EMPTY_BODY')}
      />
    );
  }

  return (
    <SearchList>
      {recentlyViewed.map((item, index) => {
        return (
          <SearchList.Item
            key={index}
            icon="History"
            subtitle={item.instance.dataType}
            title={item.name || item.instance.externalId}
            description={item.description || DASH}
            onClick={() => handleItemClick(item)}
            hideEnterIcon
          />
        );
      })}
    </SearchList>
  );
};
