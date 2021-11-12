import React, { FunctionComponent, useState } from 'react';
import { DetailFieldNames, Extpipe } from 'model/Extpipe';
import { RawEditModal } from 'components/modals/RawEditModal';
import { TEST_ID_BTN_SAVE } from 'components/extpipe/DocumentationSection';
import { useSelectedExtpipe } from 'hooks/useSelectedExtpipe';
import { useExtpipeById } from 'hooks/useExtpipe';
import { DivFlex } from 'styles/flex/StyledFlex';
import { Icon } from '@cognite/cogs.js';
import styled from 'styled-components';
import { createLink } from '@cognite/cdf-utilities';
import { AddFieldValueBtn } from 'components/buttons/AddFieldValueBtn';
import { EditableAreaButton } from 'components/extpipe/EditableAreaButton';

const RawTableWrapper = styled.div``;

const EditRawTable: FunctionComponent<{ canEdit: boolean }> = ({ canEdit }) => {
  const [showRawModal, setShowRawModal] = useState(false);
  const { extpipe: selected } = useSelectedExtpipe();
  const { data: storedExtpipe } = useExtpipeById(selected?.id);

  const toggleModal = (show: boolean) => {
    return () => {
      if (canEdit) {
        setShowRawModal(show);
      }
    };
  };

  const renderRaw = (extpipe?: Extpipe) => {
    if (!extpipe?.rawTables?.length) {
      return (
        <AddFieldValueBtn canEdit={canEdit} onClick={toggleModal(true)}>
          {DetailFieldNames.RAW_TABLE.toLowerCase()}
        </AddFieldValueBtn>
      );
    }
    return (
      <RawTableWrapper
        id="raw-table-grid"
        role="grid"
        aria-labelledby="raw-table-label"
      >
        <EditableAreaButton
          type="ghost"
          icon="Edit"
          iconPlacement="right"
          disabled={!canEdit}
          onClick={toggleModal(true)}
          title="Toggle raw table modal"
          data-testid={`${TEST_ID_BTN_SAVE}rawTable`}
          $full
        >
          <div>
            {extpipe.rawTables.map(({ dbName, tableName }) => {
              return (
                <DivFlex role="row" key={`${dbName}-${tableName}`}>
                  <a
                    role="gridcell"
                    href={createLink(`/raw/${dbName}`)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {dbName}
                  </a>
                  <Icon type="Dot" aria-hidden />
                  <a
                    role="gridcell"
                    data-testid="selected-table"
                    href={createLink(`/raw/${dbName}/${tableName}`)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {tableName}
                  </a>
                </DivFlex>
              );
            })}
          </div>
        </EditableAreaButton>
      </RawTableWrapper>
    );
  };

  return (
    <>
      <div>{renderRaw(storedExtpipe)}</div>
      <RawEditModal visible={showRawModal} close={toggleModal(false)} />
    </>
  );
};
export default EditRawTable;
