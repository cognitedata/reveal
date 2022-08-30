import React, { FunctionComponent, useState } from 'react';
import { DetailFieldNames, Extpipe } from 'model/Extpipe';
import { RawEditModal } from 'components/modals/RawEditModal';
import { TEST_ID_BTN_SAVE } from 'components/extpipe/DocumentationSection';
import { useSelectedExtpipe } from 'hooks/useSelectedExtpipe';
import { useExtpipeById } from 'hooks/useExtpipe';
import { Icon } from '@cognite/cogs.js';
import styled from 'styled-components';
import { AddFieldValueBtn } from 'components/buttons/AddFieldValueBtn';
import { Section } from 'components/extpipe/Section';
import { createLink } from '@cognite/cdf-utilities';

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
            <StyledLink
              role="gridcell"
              href={createLink(`/raw`, {
                activeTable: `["${dbName}","${tableName}",null]`,
                tabs: `[["${dbName}","${tableName}",null]]`,
              })}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>{dbName}</span>
              <Icon type="Dot" aria-hidden />
              <span>{tableName}</span>
            </StyledLink>
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

const StyledLink = styled.a`
  display: inline-flex;
  align-items: center;
`;

export default EditRawTable;
