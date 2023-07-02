import React from 'react';

import styled from 'styled-components';

import { RecentlyViewedItem } from '../../../components/cards/RecentlyViewedItem';
import { EmptyState } from '../../../components/EmptyState';
import { useNavigation } from '../../../hooks/useNavigation';
import {
  RecentlyViewed,
  useRecentlyVisited,
} from '../../../hooks/useRecentlyVisited';
import { useTranslation } from '../../../hooks/useTranslation';

interface Props {
  onSelectionClick?: () => void;
  hideShadow?: boolean;
}

export const RecentlyViewedList: React.FC<Props> = ({
  onSelectionClick,
  hideShadow,
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
    <Container hideShadow={hideShadow}>
      {recentlyViewed.map((item, index) => {
        return (
          <RecentlyViewedItem
            key={index}
            onClick={() => handleItemClick(item)}
            type={item.instance.dataType}
            name={item.name}
            description={item.description}
            externalId={item.instance.externalId}
          />
        );
      })}
    </Container>
  );
};

const Container = styled.div<{ hideShadow?: boolean }>`
  border-radius: 10px;
  padding: 8px 0;
  background: white;

  ${({ hideShadow }) => {
    if (hideShadow) {
      return;
    }

    return `
      box-shadow: 0px 1px 8px rgba(79, 82, 104, 0.06),
        0px 1px 1px rgba(79, 82, 104, 0.1);
    `;
  }}

  & > * {
    border-bottom: 1px solid #ebeef7;

    &:last-child {
      border-bottom: none;
    }
  }
`;
