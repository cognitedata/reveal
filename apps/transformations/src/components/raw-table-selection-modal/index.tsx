import { useState } from 'react';

import styled from 'styled-components';

import { useTranslation } from '@transformations/common';
import { RawTableIcon } from '@transformations/pages/transformation-details/styled-components';
import { useTransformationContext } from '@transformations/pages/transformation-details/TransformationContext';
import { getRawTabKey } from '@transformations/utils';

import { Modal, ModalProps } from '@cognite/cogs.js';

import DatabaseColumn from './DatabaseColumn';
import TableColumn from './TableColumn';

type RawTableSelectionModalProps = {
  onCancel: () => void;
  visible: ModalProps['visible'];
};

const RawTableSelectionModal = ({
  onCancel,
  visible,
}: RawTableSelectionModalProps): JSX.Element => {
  const { t } = useTranslation();

  const [selectedDatabase, setSelectedDatabase] = useState<string>();
  const [selectedTable, setSelectedTable] = useState<string>();

  const { addTab } = useTransformationContext();

  const handleOk = (): void => {
    if (selectedDatabase && selectedTable) {
      addTab({
        key: getRawTabKey(selectedDatabase, selectedTable),
        title: selectedTable,
        type: 'raw',
        database: selectedDatabase,
        table: selectedTable,
        icon: <RawTableIcon type="DataTable" />,
      });
    }
    onCancel();
  };

  return (
    <Modal
      okDisabled={!selectedDatabase || !selectedTable}
      okText={t('view-selected')}
      onCancel={onCancel}
      onOk={handleOk}
      showBorders
      title={t('select-raw-table')}
      visible={visible}
    >
      <ColumnContainer>
        <DatabaseColumn
          onChange={setSelectedDatabase}
          value={selectedDatabase}
        />
        {!!selectedDatabase && (
          <TableColumn
            database={selectedDatabase}
            onChange={setSelectedTable}
            value={selectedTable}
          />
        )}
      </ColumnContainer>
    </Modal>
  );
};

const ColumnContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  height: 250px;
`;

export default RawTableSelectionModal;
