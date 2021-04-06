import React, { useState, useEffect, useCallback } from 'react';
import { useRouteMatch, useHistory } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useDebouncedCallback } from 'use-debounce';
import moment from 'moment';
import uniq from 'lodash/uniq';
import isEqual from 'lodash/isEqual';
import { FileInfo } from '@cognite/sdk';
import { ResourceType, Filter } from 'modules/sdk-builder/types';
import { doSearch } from 'modules/search';
import {
  PendingResourceSelection,
  getActiveSelectionId,
  createSelection as create,
} from 'modules/selection';
import { dateSorter, stringCompare } from 'modules/contextualization/utils';
import {
  Col,
  Empty,
  Row,
  Select,
  Table,
  Typography,
  message,
  Checkbox,
} from 'antd';
import { Button, Icon, Tooltip, Title } from '@cognite/cogs.js';
import { usePrevious } from 'hooks/CustomHooks';
import StickyBottomRow from 'components/StickyBottomRow';
import { Popover } from 'components/Common';
import { ResourceSidebar } from 'containers/ResourceSidebar';
import NoNamePreview from 'components/NoNamePreview';
import { AssetSmallPreview, FileSmallPreview } from '@cognite/data-exploration';
import AssetSearchBar from './AssetSearchBar';
import FileSearchBar from './FileSearchBar';
import { searchCountSelector, searchItemSelector } from './selectors';

const getColumns = (type: ResourceType) => {
  switch (type) {
    default: {
      return [
        {
          title: 'Name',
          key: 'name',
          dataIndex: 'name',
          sorter: (a: any, b: any) => stringCompare(a?.name, b?.name),
          width: '40%',
          render: (name: string, item: any) => {
            switch (type) {
              case 'assets':
                return (
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Popover
                      style={{ marginRight: '6px', display: 'flex' }}
                      content={<AssetSmallPreview assetId={item.id} />}
                    >
                      <Icon type="DataStudio" />
                    </Popover>
                    <span>{name || '<no name>'}</span>
                  </div>
                );
              case 'files':
                return (
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Popover
                      style={{ marginRight: '6px', display: 'flex' }}
                      content={<FileSmallPreview fileId={item.id} />}
                    >
                      <Icon type="Document" />
                    </Popover>
                    <span>{name || '<no name>'}</span>
                  </div>
                );
              default:
                return (
                  <div>
                    {name || (
                      <NoNamePreview
                        id={item.id}
                        externalId={item.externalId}
                      />
                    )}
                  </div>
                );
            }
          },
        },
        {
          title: 'Description',
          key: 'description',
          sorter: (a: any, b: any) =>
            stringCompare(a?.description, b?.description),
          width: '40%',
          dataIndex: 'description',
        },
        {
          title: 'Last modified',
          key: 'last-modified',
          width: '15%',
          sorter: dateSorter((x: any) => x?.lastUpdatedTime!),
          render: (item: FileInfo) => {
            return moment(item.lastUpdatedTime).format('YYYY-MM-DD hh:mm');
          },
        },
      ];
    }
  }
};

const getSearchBar = (
  type: ResourceType,
  filter: Filter,
  updateFilter: (f: Filter) => void,
  lockedFilters?: Filter
) => {
  switch (type) {
    case 'files':
      return (
        <FileSearchBar
          filter={filter}
          updateFilter={updateFilter}
          lockedFilters={lockedFilters}
        />
      );
    case 'assets':
      return <AssetSearchBar filter={filter} updateFilter={updateFilter} />;
    default:
      throw new Error(`type '${type}' not supported`);
  }
};

type Props = {
  type: ResourceType;
  defaultFilters?: { [key in ResourceType]?: Filter };
  lockedFilters?: { [key in ResourceType]?: Filter };
  availableTypes?: ResourceType[];
  secondaryType?: string;
  showBottomRow?: boolean;
  onNextClicked?: (
    selectionSize: number,
    selection: PendingResourceSelection
  ) => boolean;
};

const DEFAULT_FILTERS = {};
const DEFAULT_LOCKED_FILTERS = {};
const EMPTY_FILTER: Filter = {
  search: undefined,
  filter: {},
};

export default function SearchPage({
  type,
  secondaryType,
  defaultFilters = DEFAULT_FILTERS,
  lockedFilters = DEFAULT_LOCKED_FILTERS,
  onNextClicked = () => true,
  availableTypes = [],
  showBottomRow = true,
}: Props) {
  const history = useHistory();
  const match = useRouteMatch();
  const dispatch = useDispatch();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [currentType, setCurrentType] = useState<ResourceType>(type);
  const [isSelectAll, setSelectAll] = useState(false);
  const [canSelectAll, setCanSelectAll] = useState(true);
  const [selectedRowKeys, setSelectedRowKey] = useState([] as number[]);
  // `filter` is used for rendering the selected filter,
  // `delayedFilter` is used for API-calls and store lookup.
  const [filter, setFilter] = useState<Filter>(
    defaultFilters[currentType] || EMPTY_FILTER
  );
  const [delayedFilter, setDelayedFilter] = useState<Filter>(filter);
  const [debouncedSetFilter] = useDebouncedCallback(setDelayedFilter, 300);

  const updateFilter = useCallback(
    (f: Filter) => {
      setFilter(f);
      debouncedSetFilter(f);
    },
    [debouncedSetFilter]
  );

  useEffect(() => {
    const f = { ...(defaultFilters[currentType] || EMPTY_FILTER) };
    setFilter(f);
    debouncedSetFilter(f);
  }, [currentType, defaultFilters, setFilter, debouncedSetFilter]);

  const count = useSelector(searchCountSelector(currentType, delayedFilter));

  const { items, fetching } = useSelector(searchItemSelector)(
    currentType,
    delayedFilter
  );

  const selectionId = useSelector(getActiveSelectionId)(type);

  useEffect(() => {
    if (type !== currentType) {
      setCurrentType(type);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  useEffect(() => {
    dispatch(doSearch(currentType, delayedFilter));
  }, [dispatch, currentType, delayedFilter]);

  const prevSelectAll = usePrevious(isSelectAll);
  const prevFilter = usePrevious(filter);
  const prevType = usePrevious(currentType);

  useEffect(() => {
    const shouldFilterUpdate = !!prevFilter && !isEqual(prevFilter, filter);
    const shouldTypeUpdate = !!prevType && prevType !== currentType;

    if (shouldFilterUpdate || shouldTypeUpdate) {
      setSelectAll(false);
      setSelectedRowKey([]);
      setCanSelectAll(!filter.search);
    }
  }, [filter, prevType, currentType, prevFilter]);

  useEffect(() => {
    setPage(1);
  }, [match.path]);

  useEffect(() => {
    if (isSelectAll) {
      setSelectedRowKey(items.map((item) => item.id));
    } else if (!!prevSelectAll && prevSelectAll) {
      setSelectedRowKey([]);
    }
  }, [isSelectAll, prevSelectAll, items]);
  const onPaginationChange = (newPage: number, newPageSize?: number) => {
    setPage(newPage);
    if (newPageSize) {
      setPageSize(newPageSize);
    }
  };

  const selectionSize = isSelectAll ? count || 0 : selectedRowKeys.length;

  const getSelectAllTooltip = () => {
    if (!count) {
      return 'There are no items in the list to select';
    }
    if (!canSelectAll) {
      return 'When you have a search query, you cannot select all';
    }
    return 'Select all entities';
  };

  const createSelection = async () => {
    let query;
    if (!isSelectAll) {
      query = selectedRowKeys.map((el) => ({ id: el }));
    } else {
      query = filter;
      if (selectionSize > 5000) {
        query = {
          ...query,
          limit: 1000,
        };
      }
    }
    const selection: PendingResourceSelection = {
      type: currentType,
      endpoint: isSelectAll ? 'list' : 'retrieve',
      query,
    };
    if (onNextClicked(selectionSize, selection)) {
      if (selectionSize === 0) {
        message.error('You have to select data to continue');
      }
      dispatch(create(selection));
    }
  };

  useEffect(() => {
    if (!selectionId) return;
    history.push(`${match.url}/${selectionId}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectionId]);

  const types = uniq([currentType, ...availableTypes]).map((t: string) => ({
    value: t,
    label:
      t === 'timeseries'
        ? 'Time series'
        : `${t.substring(0, 1).toUpperCase()}${t.substring(1)}`,
  }));
  types.sort();

  const dataTypeTooltip = () => {
    if (secondaryType && secondaryType === 'P&ID') {
      return 'Select P&IDs to extract tags from.';
    }
    if (secondaryType && secondaryType === 'tags') {
      return 'Select assets to connect P&ID tags to';
    }
    if (secondaryType && secondaryType === 'documents') {
      return 'Select documents to extract tags from. Note: You can only use PDF files';
    }
    return 'Select entities you want to match to assets';
  };

  return (
    <>
      <Row gutter={[0, 20]}>
        <Col>
          <Title level={2}>
            Select data
            <Tooltip content={dataTypeTooltip()} placement="right">
              <Icon type="Help" style={{ marginLeft: '10px' }} />
            </Tooltip>
          </Title>
        </Col>
      </Row>
      <Row gutter={[8, 12]}>
        {availableTypes.length > 0 && (
          <Col span={4}>
            <p>Resource type</p>
            <Select
              style={{ width: '100%' }}
              dropdownMatchSelectWidth={false}
              defaultValue={currentType}
              onChange={(rt: ResourceType) => setCurrentType(rt)}
            >
              {types.map((t) => (
                <Select.Option key={t.value} value={t.value}>
                  {t.label}
                </Select.Option>
              ))}
            </Select>
          </Col>
        )}
        {getSearchBar(currentType, filter, updateFilter, lockedFilters[type])}
      </Row>

      <Row gutter={[0, 20]}>
        <Col span={24}>
          <p id="count-text">
            {count} results. {selectionSize} selected.
          </p>
        </Col>
      </Row>

      <Table
        style={{ marginBottom: '90px', marginTop: '16px' }}
        rowSelection={{
          columnWidth: '5%',
          columnTitle: (
            <Tooltip content={getSelectAllTooltip()}>
              <Checkbox
                disabled={!canSelectAll || !count}
                onChange={(e) => setSelectAll(e.target.checked)}
                checked={isSelectAll}
              />
            </Tooltip>
          ),
          getCheckboxProps: () => {
            if (isSelectAll) {
              return {
                disabled: true,
              };
            }
            return {};
          },
          onSelect: (asset, selected) => {
            if (isSelectAll) {
              message.info(
                'Currently only manual selection or select all is supported.'
              );
            } else if (selected) {
              setSelectedRowKey([...selectedRowKeys, asset.id]);
            } else {
              setSelectedRowKey(
                selectedRowKeys.filter((el) => el !== asset.id)
              );
            }
          },
          selectedRowKeys,
        }}
        columns={getColumns(currentType)}
        rowKey="id"
        pagination={{
          position: ['bottomLeft'],
          showQuickJumper: true,
          showSizeChanger: true,
          pageSize,
          current: page,
          onChange: onPaginationChange,
          onShowSizeChange: onPaginationChange,
        }}
        loading={fetching}
        // since sometimes the JS object from SDK has a .children object.
        dataSource={items.map((el) => ({ ...el }))}
        locale={{
          emptyText: (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={`No ${secondaryType ?? currentType} found`}
            />
          ),
        }}
      />
      {showBottomRow && (
        <StickyBottomRow>
          <Button
            size="large"
            type="secondary"
            onClick={() => history.goBack()}
          >
            Back
          </Button>
          <div>
            <Typography.Text strong>{selectionSize} selected</Typography.Text>
            <Button
              size="large"
              type="primary"
              disabled={selectionSize === 0}
              onClick={createSelection}
              style={{ marginLeft: '20px' }}
            >
              Next
            </Button>
          </div>
        </StickyBottomRow>
      )}
      <ResourceSidebar />
    </>
  );
}
