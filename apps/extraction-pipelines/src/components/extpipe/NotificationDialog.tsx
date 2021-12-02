import React, { FunctionComponent, useState } from 'react';
import { EditModal } from 'components/modals/EditModal';
import { Button, Input, Select } from '@cognite/cogs.js';

import { DivFlex } from 'styles/flex/StyledFlex';
import { IconHeading } from 'styles/StyledHeadings';
import styled from 'styled-components';
import { StyledLabel } from 'styles/StyledForm';
import { OptionTypeBase } from 'react-select';
import { Extpipe } from 'model/Extpipe';
import { InfoBox } from 'components/message/InfoBox';
import {
  createUpdateSpec,
  useDetailsUpdate,
} from 'hooks/details/useDetailsUpdate';
import { useAppEnv } from 'hooks/useAppEnv';
import { ErrorMessage } from 'components/error/ErrorMessage';

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
  const { project } = useAppEnv();
  const { mutate } = useDetailsUpdate();
  const oldValue = minutesToUnit(
    extpipe.notificationConfig?.allowedNotSeenRangeInMinutes ?? 0
  );
  const [showErrors, setShowErrors] = useState(false);
  const [value, setValue] = useState(oldValue.n);
  const [timeUnit, setTimeUnit] = useState(oldValue.unit);
  const timeOptions = [
    { label: 'minutes', value: 'minutes' },
    { label: 'hours', value: 'hours' },
    { label: 'days', value: 'days' },
  ];
  const isValid = () => value > 0;
  const onConfirm = async () => {
    if (!extpipe || !project) return;
    if (!isValid()) {
      setShowErrors(true);
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
        alert('An error occurred');
      },
      onSuccess: () => {
        close();
      },
    });
  };
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
            value={timeOptions.find((x) => x.value === timeUnit)!}
            options={timeOptions}
            onChange={(option: OptionTypeBase) => {
              setTimeUnit(option.value);
            }}
          />
        </div>
      </DivFlex>
      {showErrors && !isValid() && (
        <ErrorMessage>Value must be bigger than 0</ErrorMessage>
      )}
      <Hr />
      <InfoBox iconType="InfoFilled">
        You can manage who will receive notifications in the contacts section.
      </InfoBox>
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
