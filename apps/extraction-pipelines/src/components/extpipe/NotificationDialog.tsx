import React, { FunctionComponent, useState } from 'react';
import { EditModal } from 'components/modals/EditModal';
import { Button, Input, Select } from '@cognite/cogs.js';

import { DivFlex } from 'components/styled';
import { IconHeading } from 'components/styled';
import styled from 'styled-components';
import { StyledLabel } from 'components/styled';
import { OptionTypeBase } from 'react-select';
import { Extpipe } from 'model/Extpipe';
import { InfoBox } from 'components/message/InfoBox';
import {
  createUpdateSpec,
  useDetailsUpdate,
} from 'hooks/details/useDetailsUpdate';
import { ErrorMessage } from 'components/error/ErrorMessage';
import { getProject } from '@cognite/cdf-utilities';

const Hr = styled.hr`
  border: 0;
  border-bottom: 1px solid #ddd;
  margin: 1.5rem 0;
`;

const MINUTES_IN_HOUR = 60;
const MINUTES_IN_DAY = 24 * MINUTES_IN_HOUR;
const timeUnitToMinutesMultiplier = {
  minutes: 1,
  hours: MINUTES_IN_HOUR,
  days: MINUTES_IN_DAY,
};
export const minutesToUnit = (
  minutes: number
): { unit: 'hours' | 'days' | 'minutes'; n: number } => {
  if (minutes === 0) return { n: 0, unit: 'hours' };
  if (minutes % MINUTES_IN_DAY === 0)
    return { n: minutes / MINUTES_IN_DAY, unit: 'days' };
  if (minutes % MINUTES_IN_HOUR === 0)
    return { n: minutes / MINUTES_IN_HOUR, unit: 'hours' };
  return { n: minutes, unit: 'minutes' };
};

type NotificationDialogProps = {
  isOpen: boolean;
  extpipe: Extpipe;
  close: () => void;
};
export const NotificationDialog: FunctionComponent<NotificationDialogProps> = ({
  isOpen,
  extpipe,
  close,
}) => {
  const project = getProject();
  const { mutate } = useDetailsUpdate();
  const oldValue = minutesToUnit(
    extpipe.notificationConfig?.allowedNotSeenRangeInMinutes ?? 0
  );
  const [errorMessage, setErrorMessage] = useState<null | string>(null);
  const [value, setValue] = useState(oldValue.n);
  const [timeUnit, setTimeUnit] = useState(oldValue.unit);
  const timeOptions = [
    { label: 'minutes', value: 'minutes' },
    { label: 'hours', value: 'hours' },
    { label: 'days', value: 'days' },
  ];
  const numContactsWithNotificationsTurnedOn = (extpipe.contacts ?? []).reduce(
    (sum, contact) => sum + (contact.sendNotification ? 1 : 0),
    0
  );
  const onConfirm = async () => {
    if (!extpipe || !project) return;
    if (!Number.isFinite(value) || value <= 0) {
      setErrorMessage('Enter a value greater than 0');
      return;
    }
    const items = createUpdateSpec({
      project,
      id: extpipe.id,
      fieldValue: {
        allowedNotSeenRangeInMinutes:
          value * timeUnitToMinutesMultiplier[timeUnit],
      },
      fieldName: 'notificationConfig',
    });
    await mutate(items, {
      onError: () => {
        setErrorMessage(
          'An error occurred. The new notification settings was not saved due to an error. Make sure everything is filled out correctly, and try again.'
        );
      },
      onSuccess: () => {
        close();
      },
    });
  };
  return (
    <EditModal
      width={700}
      title="Notifications settings"
      visible={isOpen}
      close={close}
    >
      <IconHeading icon="BellFilled">Run alerts</IconHeading>
      <p>Get alerted when runs fail.</p>
      <Hr />
      <IconHeading icon="BellFilled">Last seen status</IconHeading>
      <p>
        Allows you to track if the extraction pipeline is down due to connection
        issues.
      </p>
      <StyledLabel htmlFor="time-amount-input">
        Send an alert if there has been no activity for
      </StyledLabel>
      <DivFlex css="width: 250px; margin-top: 0.5rem;" gap="0.5rem">
        <div css="flex: 1">
          <Input
            fullWidth
            type="number"
            placeholder="3"
            id="time-amount-input"
            value={value}
            onChange={(e) => setValue(parseInt(e.target.value, 10))}
          />
        </div>
        <div css="flex: 2">
          <Select
            fullWidth
            closeMenuOnSelect
            value={timeOptions.find((x) => x.value === timeUnit)!}
            options={timeOptions}
            onChange={(option: OptionTypeBase) => {
              setTimeUnit(option.value);
            }}
          />
        </div>
      </DivFlex>
      {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
      <Hr />
      {numContactsWithNotificationsTurnedOn === 0 ? (
        <InfoBox iconType="WarningFilled" color="warning">
          There are currently no contacts that will receive notifications. You
          can manage this in the contact section.
        </InfoBox>
      ) : (
        <InfoBox iconType="InfoFilled">
          You can manage who will receive notifications in the contacts section.
        </InfoBox>
      )}
      <DivFlex justify="flex-end" css="gap: 0.5rem; margin-top: 1rem">
        <Button type="ghost" onClick={close}>
          Cancel
        </Button>
        <Button type="primary" onClick={onConfirm}>
          Confirm
        </Button>
      </DivFlex>
    </EditModal>
  );
};
