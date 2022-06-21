import React, { FunctionComponent, useState } from 'react';
import { DetailFieldNames, Extpipe } from 'model/Extpipe';
import { RawEditModal } from 'components/modals/RawEditModal';
import { TEST_ID_BTN_SAVE } from 'components/extpipe/DocumentationSection';
import { useSelectedExtpipe } from 'hooks/useSelectedExtpipe';
import { useExtpipeById } from 'hooks/useExtpipe';
import { DivFlex } from 'styles/flex/StyledFlex';
import { Icon } from '@cognite/cogs.js';
import styled from 'styled-components';
import { AddFieldValueBtn } from 'components/buttons/AddFieldValueBtn';
import { Section } from 'components/extpipe/Section';
import { createRedirectLink } from 'utils/utils';

const RawTableWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0 1rem;
`;

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
      <RawTableWrapper>
        {extpipe.rawTables.map(({ dbName, tableName }) => {
          return (
            <DivFlex role="row" key={`${dbName}-${tableName}`}>
              <a
                role="gridcell"
                href={createRedirectLink(`/raw/${dbName}`)}
                target="_blank"
                rel="noopener noreferrer"
              >
                {dbName}
              </a>
              <Icon type="Dot" aria-hidden />
              <a
                role="gridcell"
                data-testid="selected-table"
                href={createRedirectLink(`/raw/${dbName}/${tableName}`)}
                target="_blank"
                rel="noopener noreferrer"
              >
                {tableName}
              </a>
            </DivFlex>
          );
        })}
      </RawTableWrapper>
    );
  };

  return (
    <Section
      title="RAW tables"
      icon="TableViewSmall"
      editButton={{ onClick: openDialog, canEdit }}
      data-testid={`${TEST_ID_BTN_SAVE}rawTable`}
    >
      <div>{renderRaw(storedExtpipe)}</div>
      <RawEditModal visible={showRawModal} close={closeDialog} />
    </Section>
  );
};
export default EditRawTable;
