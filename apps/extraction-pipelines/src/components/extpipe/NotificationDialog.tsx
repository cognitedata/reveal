import React, { FunctionComponent, useState } from 'react';
import { EditModal } from 'components/modals/EditModal';
import { Button, Input, Select } from '@cognite/cogs.js';

import { DivFlex } from 'styles/flex/StyledFlex';
import { IconHeading } from 'styles/StyledHeadings';
import styled from 'styled-components';
import { StyledLabel } from 'styles/StyledForm';

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
  const [timeUnit, setTimeUnit] = useState('hours');
  const timeOptions = [
    { label: 'minutes', value: 'minutes' },
    { label: 'hours', value: 'hours' },
    { label: 'days', value: 'days' },
  ];
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
      <StyledLabel htmlFor="time-amount-input">
        Send an alert if there has been no activity for
      </StyledLabel>
      <DivFlex css="width: 250px" gap="0.5rem">
        <div css="flex: 1">
          <Input fullWidth placeholder="3" id="time-amount-input" />
        </div>
        <div css="flex: 2">
          <Select
            fullWidth
            value={timeOptions.find((x) => x.value === timeUnit)!}
            options={timeOptions}
            onChange={(v: { value: React.SetStateAction<string> }) =>
              setTimeUnit(v.value)
            }
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
