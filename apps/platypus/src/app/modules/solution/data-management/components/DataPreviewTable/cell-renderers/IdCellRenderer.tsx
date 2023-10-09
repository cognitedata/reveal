import React, { useState } from 'react';

import styled from 'styled-components';

import { DataModelTypeDefsType, KeyValueMap } from '@platypus/platypus-core';
import { ICellRendererParams } from 'ag-grid-community';

import { Button, Flex, Chip, Modal } from '@cognite/cogs.js';

import { useGraphViewerFeatureFlag } from '../../../../../../flags';
import { useMixpanel } from '../../../../../../hooks/useMixpanel';
import { useTranslation } from '../../../../../../hooks/useTranslation';
import { RelationViewer } from '../../RelationViewer/RelationViewer';
import { getNodeId } from '../../RelationViewer/utils';

interface IdCellRendererProps extends ICellRendererParams {
  onRowAdd: (draftRowData: KeyValueMap) => void;
}

export const IdCellRenderer = React.memo((props: IdCellRendererProps) => {
  const { t } = useTranslation('IdCellRenderer');
  const { track } = useMixpanel();
  const isDraftCompleted = props.data?._draftStatus === 'Completed';
  const isRowPinnedOnTop = props.node.rowPinned === 'top';
  const [isRelationViewerOpen, setIsRelationViewerOpen] = useState(false);
  const { isEnabled: isRelationViewerEnabled } = useGraphViewerFeatureFlag();
  const handleAddClick = () => {
    props.onRowAdd(props.data);
  };
  const { dataModelType } = props.context as {
    dataModelType: DataModelTypeDefsType;
  };
  return (
    <Flex justifyContent="space-between" alignItems="center">
      <IdCellValueText>{props.value}</IdCellValueText>
      {isRelationViewerEnabled && !isRowPinnedOnTop && (
        <Button
          className="network"
          icon="Network"
          type="secondary"
          aria-label="Open graph"
          onClick={() => {
            track('Graph.Open');
            setIsRelationViewerOpen(true);
          }}
        />
      )}
      {isRowPinnedOnTop && !isDraftCompleted && (
        <Chip
          label={t('draft_label', 'Draft')}
          size="small"
          data-cy="draft-row"
        />
      )}
      {isRowPinnedOnTop && isDraftCompleted && (
        <Button
          size="small"
          type="primary"
          data-cy="handle-add-row-button"
          onClick={handleAddClick}
        >
          {t('add_button', 'Add')}
        </Button>
      )}
      {isRelationViewerOpen && (
        <Modal
          visible
          size="full-screen"
          title="Relationship Viewer"
          onCancel={() => setIsRelationViewerOpen(false)}
          onOk={() => setIsRelationViewerOpen(false)}
        >
          <RelationViewer
            initialNodes={[
              {
                externalId: props.value,
                __typename: dataModelType.name,
                space: props.data.space,
                id: getNodeId(props.data),
              },
            ]}
            initialEdges={[]}
          />
        </Modal>
      )}
    </Flex>
  );
});

const IdCellValueText = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  padding-right: 8px;
  flex: 1;
`;
