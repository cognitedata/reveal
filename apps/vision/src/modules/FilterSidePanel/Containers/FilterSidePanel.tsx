import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import styled from 'styled-components';

import { CaretRightOutlined } from '@ant-design/icons';
import { Collapse } from 'antd';

import { Body, Button, Title, Tooltip } from '@cognite/cogs.js';
import { FileFilterProps } from '@cognite/sdk';

import { totalFileCount } from '../../../api/file/aggregate';
import { cancelFetch } from '../../../api/file/fetchFiles/fetchFiles';
import { useThunkDispatch } from '../../../store';
import { RootState } from '../../../store/rootReducer';
import { ClearButton } from '../../Explorer/Components/ClearButton';
import { selectExploreFileCount } from '../../Explorer/store/selectors';
import {
  setExplorerFilter,
  toggleExplorerFilterView,
} from '../../Explorer/store/slice';
import { FilterItemHeader } from '../Components/FilterItemHeader';
import {
  FilterPanelConfigItem,
  getFilterPanelItems,
} from '../Components/getFilterPanelItems';

const { Panel } = Collapse;

export const FilterSidePanel = () => {
  const [totalCount, setTotalCount] = useState<number>(0);
  const dispatch = useThunkDispatch();
  const filter = useSelector(
    ({ explorerReducer }: RootState) => explorerReducer.filter
  );
  const exploreFileCount = useSelector((state: RootState) =>
    selectExploreFileCount(state.explorerReducer)
  );
  const filterCount = Object.values(filter).filter((f) => f).length;

  const setFilter = useCallback((newFilter: FileFilterProps) => {
    cancelFetch();
    dispatch(setExplorerFilter(newFilter));
  }, []);

  const disableClearAllFilters = filterCount <= 0;
  const clearAllFilters = () => {
    setFilter({});
  };

  useEffect(() => {
    (async () => {
      totalFileCount(filter).then((res) => {
        setTotalCount(res);
      });
    })();
  }, [filter]);

  return (
    <>
      <FilterResult>
        <FilterTitle>
          <Title level={4} as="h1">
            Filters
          </Title>
          <HideFiltersTooltip content="Hide">
            <Button
              icon="PanelLeft"
              onClick={() => dispatch(toggleExplorerFilterView())}
              size="small"
              type="ghost"
              aria-label="button"
            />
          </HideFiltersTooltip>
        </FilterTitle>
        <FilterBody>
          <Body level={3}>
            Results: {exploreFileCount} files out of {totalCount}
            <br />
            Active filters({filterCount})
            <ClearButton
              clear={clearAllFilters}
              disableClear={disableClearAllFilters}
            >
              Clear All
            </ClearButton>
          </Body>
        </FilterBody>
      </FilterResult>
      <CollapsePanel>
        <Collapse
          bordered={false}
          defaultActiveKey={[]}
          expandIconPosition="end"
          expandIcon={({ isActive }) => (
            <CaretRightOutlined
              style={{ color: '#595959' }}
              rotate={isActive ? 90 : 180}
            />
          )}
        >
          {getFilterPanelItems(filter, setFilter).map(
            (item: FilterPanelConfigItem) => (
              <Panel
                style={{ maxWidth: '318px' }}
                header={
                  <FilterItemHeader
                    headerText={item.headerText}
                    disableClear={item.disableClear}
                    clear={item.clear}
                  />
                }
                key={item.key}
              >
                {item.filterItem}
              </Panel>
            )
          )}
        </Collapse>
      </CollapsePanel>
    </>
  );
};

const FilterResult = styled.div`
  padding: 11px 17px 0 20px;
  z-index: 1;
`;
const FilterTitle = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;
const FilterBody = styled.div`
  display: flex;
  align-items: center;
  width: 201px;
  height: 58px;
`;
const HideFiltersTooltip = styled(Tooltip)`
  margin-bottom: 8px;
`;

const CollapsePanel = styled.div`
  overflow: auto;
  height: 100%;
  .ant-collapse-header {
    padding: 8px 51px 10px 20px;
  }
  .ant-collapse-content-active {
    padding: 8px 20px 26px 20px;
  }
  .ant-collapse-content-box {
    padding: 0;
  }
`;
