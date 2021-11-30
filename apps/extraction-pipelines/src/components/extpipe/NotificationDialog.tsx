import React, { FunctionComponent } from 'react';
import { EditModal } from 'components/modals/EditModal';
import { Button, Input, Select } from '@cognite/cogs.js';

import { DivFlex } from 'styles/flex/StyledFlex';
import { IconHeading } from 'styles/StyledHeadings';
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
    <EditModal
      width={700}
      title="Configure alerts"
      visible={isOpen}
      close={close}
    >
      <IconHeading icon="BellNotification">Run alerts</IconHeading>
      <p>Get alerted when runs fail</p>
      <Hr />
      <IconHeading icon="BellNotification">Last seen status</IconHeading>
      <p>
        Allows you to track if the extraction pipeline is down due to connection
        issues.{' '}
      </p>
      <label htmlFor="time-amount-input">
        Send an alert if there has been no activity for
      </label>
      <DivFlex css="width: 250px" gap="0.5rem">
        <div css="flex: 1">
          <Input fullWidth placeholder="3" id="time-amount-input" />
        </div>
        <div css="flex: 2">
          <Select
            fullWidth
            value={{ label: 'hours', value: 'hours' }}
            options={[
              { label: 'minutes', value: 'minutes' },
              { label: 'hours', value: 'hours' },
              { label: 'days', value: 'days' },
            ]}
          />
        </div>
      </DivFlex>
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
