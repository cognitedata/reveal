import React, { useCallback } from 'react';

import styled from 'styled-components';

import { RecentlyViewedItem } from '../../../components/cards/RecentlyViewedItem';
import { getRecentlyViewed } from '../../../fixtures';
import { useDataModelParams } from '../../../hooks/useDataModelParams';
import { useNavigation } from '../../../hooks/useNavigation';

export const RecentlyViewedList = () => {
  const { toInstancePage } = useNavigation();

  const selectedDataModel = useDataModelParams();

  const recentData = getRecentlyViewed();

  const handleItemClick = useCallback(
    (item: any) => {
      if (selectedDataModel) {
        toInstancePage(
          item.instance.dataType,
          item.instance.space,
          item.instance.externalId
        );
      }
    },
    [toInstancePage, selectedDataModel]
  );

  return (
    <>
      {recentData.map((item) => {
        return (
          <RecentlyViewedContent onClick={() => handleItemClick(item)}>
            <RecentlyViewedItem
              type={item.instance.dataType}
              name={item.name}
              description={item.description}
              externalId={item.instance.externalId}
            />
          </RecentlyViewedContent>
        );
      })}
    </>
  );
};

const RecentlyViewedContent = styled.div`
  padding: 6px 0;
  border-radius: 8px;
  border: 1px solid #ebeef7;
  margin-bottom: 4px;

  &:hover {
    cursor: pointer;
  }
`;
