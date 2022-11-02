import { Button, Flex, Label } from '@cognite/cogs.js';
import { KeyValueMap } from '@platypus/platypus-core';
import { ICellRendererParams } from 'ag-grid-community';
import { useTranslation } from '@platypus-app/hooks/useTranslation';
import React from 'react';
import styled from 'styled-components';

interface IdCellRendererProps extends ICellRendererParams {
  onRowAdd: (draftRowData: KeyValueMap) => void;
}

export const IdCellRenderer = React.memo((props: IdCellRendererProps) => {
  const { t } = useTranslation('IdCellRenderer');
  const isDraftCompleted = props.data?._draftStatus === 'Completed';
  const isRowPinnedOnTop = props.node.rowPinned === 'top';
  const handleAddClick = () => {
    props.onRowAdd(props.data);
  };
  return (
    <Flex
      justifyContent="space-between"
      alignItems="center"
      style={{ height: '100%', userSelect: 'text' }}
    >
      <IdCellValueText>{props.value}</IdCellValueText>
      {isRowPinnedOnTop && !isDraftCompleted && (
        <Label size="small" variant="unknown" data-cy="draft-row">
          {t('draft_label', 'Draft')}
        </Label>
      )}
      {isRowPinnedOnTop && isDraftCompleted && (
        <Button
          size="small"
          variant="default"
          type="primary"
          data-cy="handle-add-row-button"
          onClick={handleAddClick}
        >
          {t('add_button', 'Add')}
        </Button>
      )}
    </Flex>
  );
});

const IdCellValueText = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  padding-right: 8px;
`;
