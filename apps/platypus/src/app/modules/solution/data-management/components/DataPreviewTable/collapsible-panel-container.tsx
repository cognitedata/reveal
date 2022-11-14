import { CogDataList, PrimitiveTypesListData } from '@cognite/cog-data-grid';
import { CollapsablePanel, Body, Title, Button, Input } from '@cognite/cogs.js';
import { useTranslation } from '@platypus-app/hooks/useTranslation';
import { AgGridReact } from 'ag-grid-react';
import {
  ChangeEvent,
  ReactElement,
  SetStateAction,
  useCallback,
  useRef,
  useState,
} from 'react';
import { SidePanelTitle } from './data-preview-side-panel-title';
import { SidePanel } from './SidePanel';

import * as S from './elements';

export type ListDataType = {
  fieldName: string;
  data: PrimitiveTypesListData;
};

export type CollapsiblePanelContainerProps = {
  children: ReactElement;
  listData: { fieldName: string; data: PrimitiveTypesListData } | undefined;
  setListData: (value: SetStateAction<ListDataType | undefined>) => void;
  dataModelTypeName: string;
};

export const CollapsiblePanelContainer: React.FC<
  CollapsiblePanelContainerProps
> = ({ children, listData, setListData, dataModelTypeName }) => {
  const { t } = useTranslation('DataPreviewCollapsiblePanelContainer');
  const gridRef = useRef<AgGridReact>(null);
  const [openSearchInput, setOpenSearchInput] = useState<boolean>(false);

  const onSearchInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      gridRef.current?.api.setQuickFilter(event.target.value);
    },
    []
  );

  const onSearchInputCancel = useCallback(() => {
    setOpenSearchInput(false);
    gridRef.current?.api.setQuickFilter('');
  }, []);

  const handleCloseListDataSidePanel = useCallback(() => {
    setListData(undefined);
  }, [setListData]);

  const PrimitiveTypeListSidePanel = (
    <SidePanel
      title={
        <SidePanelTitle
          listLength={listData?.data.length || 0}
          fieldName={listData?.fieldName || ''}
          dataModelTypeName={dataModelTypeName}
        />
      }
      onCloseClick={handleCloseListDataSidePanel}
    >
      {listData?.data && (
        <>
          {!openSearchInput && (
            <Button
              data-cy="side-panel-search-button"
              icon="Search"
              type="secondary"
              onClick={() => setOpenSearchInput(true)}
            />
          )}
          {openSearchInput && (
            <>
              <Input
                data-cy="side-panel-search-input"
                autoFocus
                onChange={onSearchInputChange}
              />
              <Button
                data-cy="side-panel-search-cancel-button"
                type="link"
                variant="ghost"
                onClick={onSearchInputCancel}
                aria-label="side-panel-search-cancel-button"
              >
                {t('side-panel-list-search-cancel-btn', 'Cancel')}
              </Button>
            </>
          )}
          <CogDataList ref={gridRef} listData={listData.data || []} />
        </>
      )}
    </SidePanel>
  );

  return (
    <S.CollapsablePanelContainer>
      <CollapsablePanel
        sidePanelRight={PrimitiveTypeListSidePanel}
        sidePanelRightVisible={!!listData}
        sidePanelRightWidth={376}
      >
        {children}
      </CollapsablePanel>
    </S.CollapsablePanelContainer>
  );
};
