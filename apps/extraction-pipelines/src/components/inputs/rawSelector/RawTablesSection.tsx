import React, { FunctionComponent, useState } from 'react';
import { Extpipe } from 'model/Extpipe';
import { RawEditModal } from 'components/modals/RawEditModal';
import { TEST_ID_BTN_SAVE } from 'components/extpipe/DocumentationSection';
import { useSelectedExtpipe } from 'hooks/useExtpipe';
import { Body, Button, Colors, Flex, Icon } from '@cognite/cogs.js';
import styled from 'styled-components';
import Section from 'components/section';
import { createLink } from '@cognite/cdf-utilities';
import { useTranslation } from 'common';

const RawTableWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const EditRawTable: FunctionComponent<{ canEdit: boolean }> = ({ canEdit }) => {
  const [showRawModal, setShowRawModal] = useState(false);
  const { data: storedExtpipe } = useSelectedExtpipe();

  const { t } = useTranslation();

  const openDialog = () => canEdit && setShowRawModal(true);
  const closeDialog = () => setShowRawModal(false);
  const renderRaw = (extpipe?: Extpipe) => {
    if (!extpipe?.rawTables?.length) {
      return t('no-table-selected');
    }
    return (
      <RawTableWrapper>
        {extpipe.rawTables.map(({ dbName, tableName }) => {
          return (
            <Flex alignItems="flex-end">
              <StyledMutedBody level={3}>{dbName}</StyledMutedBody>
              <StyledMutedIcon type="Dot" aria-hidden />
              <StyledLink
                role="gridcell"
                href={createLink(`/raw`, {
                  activeTable: `["${dbName}","${tableName}",null]`,
                  tabs: `[["${dbName}","${tableName}",null]]`,
                })}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>{tableName}</span>
              </StyledLink>
            </Flex>
          );
        })}
      </RawTableWrapper>
    );
  };

  return (
    <>
      <RawEditModal visible={showRawModal} close={closeDialog} />
      <Section
        extra={
          <Button
            disabled={!canEdit}
            onClick={openDialog}
            size="small"
            type="ghost"
          >
            {t('edit')}
          </Button>
        }
        title="RAW tables"
        icon="TableViewSmall"
        data-testid={`${TEST_ID_BTN_SAVE}rawTable`}
        items={[
          {
            key: 'raw-tables',
            value: <div>{renderRaw(storedExtpipe)}</div>,
          },
        ]}
      />
    </>
  );
};

const StyledLink = styled.a`
  display: inline-flex;
  align-items: center;
`;

const StyledMutedBody = styled(Body)`
  color: ${Colors['text-icon--muted']};
`;

const StyledMutedIcon = styled(Icon)`
  color: ${Colors['text-icon--muted']};
`;

export default EditRawTable;
