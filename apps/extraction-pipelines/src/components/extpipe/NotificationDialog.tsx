import React, { FunctionComponent } from 'react';
import { EditModal } from 'components/modals/EditModal';
import { Button } from '@cognite/cogs.js';
import { DivFlex } from 'styles/flex/StyledFlex';
import { IconHeading, StyledTitle3 } from 'styles/StyledHeadings';
import styled from 'styled-components';

const Hr = styled.hr`
  border: 0;
  border-bottom: 1px solid #ccc;
  margin: 1.5rem 0;
`;

type NotificationDialogProps = {
  isOpen: boolean;
  close: () => void;
};
export const NotificationDialog: FunctionComponent<NotificationDialogProps> = ({
  isOpen,
  close,
}) => {
  return (
    <EditModal title="Configure alerts" visible={isOpen} close={close}>
      <IconHeading icon="BellNotification">Run alerts</IconHeading>
      <p>Get alerted when runs fail</p>
      <Hr />
      <StyledTitle3>Last seen status</StyledTitle3>
      <p>
        Allows you to track if the extraction pipeline is down due to connection
        issues.{' '}
      </p>
      <Hr />
      <DivFlex justify="flex-end" css="gap: 0.5rem">
        <Button type="ghost" onClick={close}>
          Cancel
        </Button>
        <Button type="primary" onClick={() => {}}>
          Confirm
        </Button>
      </DivFlex>
    </EditModal>
  );
};
