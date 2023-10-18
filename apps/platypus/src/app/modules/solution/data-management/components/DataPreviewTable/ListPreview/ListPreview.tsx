import { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react';

import { DataModelTypeDefsType } from '@platypus/platypus-core';
import { GridReadyEvent } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';

import { CogDataList } from '@cognite/cog-data-grid';
import { Button, Input, Flex } from '@cognite/cogs.js';

import { Notification } from '../../../../../../components/Notification/Notification';
import { useDebounce } from '../../../../../../hooks/useDebounce';
import { useTranslation } from '../../../../../../hooks/useTranslation';
import { useNestedListDataSource } from '../../../hooks/useNestedListDataSource';
import { usePreviewData } from '../../../hooks/usePreviewData';

const PAGE_LIMIT = 100;

export type ListPreviewProps = {
  externalId: string;
  field: string;
  dataModelType: DataModelTypeDefsType;
  instanceSpace: string;
};

export const ListPreview: React.FC<ListPreviewProps> = ({
  externalId,
  field,
  dataModelType,
  instanceSpace,
}) => {
  const { t } = useTranslation('DataPreviewCollapsiblePanelContainer');
  const gridRef = useRef<AgGridReact>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchValue = useDebounce(searchTerm, 300);

  const onSearchInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const onSearchInputCancel = () => {
    setIsSearchOpen(false);
    setSearchTerm('');
  };

  const isCustomType =
    dataModelType.fields.find((el) => el.name === field)?.type.custom || false;

  const onError = (error: any) => {
    Notification({
      type: 'error',
      message: error.message,
    });
  };

  const nestedListDataSource = useNestedListDataSource({
    dataModelType,
    instanceSpace,
    onError,
  });

  const onGridReady = useCallback(
    (grid: GridReadyEvent) => {
      grid.api.setDatasource(nestedListDataSource);
    },
    [nestedListDataSource]
  );

  const { data: defaultData = { [field]: [] } } = usePreviewData({
    dataModelType,
    externalId,
    instanceSpace,
    limitFields: [field],
    nestedLimit: PAGE_LIMIT,
  });

  useEffect(() => {
    if (gridRef.current && gridRef.current.api) {
      gridRef.current?.api.onFilterChanged();
    }
  }, [debouncedSearchValue, field, externalId, defaultData]);

  return (
    <>
      <Flex>
        {!isSearchOpen && (
          <Button
            data-cy="side-panel-search-button"
            icon="Search"
            type="secondary"
            aria-label="side-panel-search-button"
            onClick={() => setIsSearchOpen(true)}
          />
        )}
        {isSearchOpen && (
          <>
            <Input
              data-cy="side-panel-search-input"
              autoFocus
              onChange={onSearchInputChange}
            />
            <Button
              data-cy="side-panel-search-cancel-button"
              type="ghost"
              onClick={onSearchInputCancel}
              aria-label="side-panel-search-cancel-button"
            >
              {t('side-panel-list-search-cancel-btn', 'Cancel')}
            </Button>
          </>
        )}
      </Flex>
      <CogDataList
        ref={gridRef}
        onGridReady={onGridReady}
        gridOptions={{
          enableCellTextSelection: true,
          enableCellExpressions: false,
          rowModelType: 'infinite',
          rowBuffer: PAGE_LIMIT / 2,
          // how big each page in our page cache will be, default is 100
          cacheBlockSize: PAGE_LIMIT,
          // this needs to be 1 since we use cursor-based pagination
          maxConcurrentDatasourceRequests: 1,
        }}
        context={{
          searchTerm: debouncedSearchValue,
          isCustomType,
          externalId,
          field,
          defaultData,
          limit: PAGE_LIMIT,
        }}
      />
    </>
  );
};
