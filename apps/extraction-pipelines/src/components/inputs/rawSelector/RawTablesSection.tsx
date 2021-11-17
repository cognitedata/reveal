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
import { Section } from 'components/extpipe/Section';

const RawTableWrapper = styled.div``;

const EditRawTable: FunctionComponent<{ canEdit: boolean }> = ({ canEdit }) => {
  const [showRawModal, setShowRawModal] = useState(false);
  const { extpipe: selected } = useSelectedExtpipe();
  const { data: storedExtpipe } = useExtpipeById(selected?.id);

  const openDialog = () => canEdit && setShowRawModal(true);
  const closeDialog = () => setShowRawModal(false);
  const renderRaw = (extpipe?: Extpipe) => {
    if (!extpipe?.rawTables?.length) {
      return (
        <AddFieldValueBtn canEdit={canEdit} onClick={openDialog}>
          {DetailFieldNames.RAW_TABLE.toLowerCase()}
        </AddFieldValueBtn>
      );
    }
    return (
      <Section
        title="RAW tables"
        icon="Table"
        editButton={{ onClick: openDialog, canEdit }}
      >
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
            onClick={openDialog}
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
      </Section>
    );
  };

  return (
    <>
      <div>{renderRaw(storedExtpipe)}</div>
      <RawEditModal visible={showRawModal} close={closeDialog} />
    </>
  );
};
export default EditRawTable;
