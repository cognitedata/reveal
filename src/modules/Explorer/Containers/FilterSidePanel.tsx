/* eslint-disable @cognite/no-number-z-index */
import React, { useEffect, useState } from 'react';
import { Collapse } from 'antd';
import { CaretRightOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { Body, Button, Title, Tooltip } from '@cognite/cogs.js';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';
import { FileFilterProps } from '@cognite/cdf-sdk-singleton';
import { totalFileCount } from 'src/api/file/aggregate';
import { FilterItemHeader } from '../Components/FilterItemHeader';
import {
  selectExploreFileCount,
  setExplorerFilter,
  toggleExplorerFilterView,
} from '../store/explorerSlice';
import {
  getFilterPanelItems,
  FilterPanelConfigItem,
} from '../Components/getFilterPanelItems';
import { ClearButton } from '../Components/ClearButton';

const { Panel } = Collapse;

export const FilterSidePanel = () => {
  const [totalCount, setTotalCount] = useState<number>(0);
  const dispatch = useDispatch();
  const filter = useSelector(
    ({ explorerReducer }: RootState) => explorerReducer.filter
  );
  const exploreFileCount = useSelector((state: RootState) =>
    selectExploreFileCount(state.explorerReducer)
  );
  const filterCount = Object.values(filter).filter((f) => f).length;

  const setFilter = (newFilter: FileFilterProps) => {
    dispatch(setExplorerFilter(newFilter));
  };

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
            Filter result
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
          expandIconPosition="right"
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
  padding: 11px 17px 0px 20px;
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
  margin-bottom: 8;
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
    padding: 0px;
  }
`;
