import React, { FunctionComponent, useState } from 'react';
import { OptionTypeBase } from 'react-select';

import styled from 'styled-components';

import { Button, Input, Select } from '@cognite/cogs.js';

import { useTranslation } from '../../common';
import {
  createUpdateSpec,
  useDetailsUpdate,
} from '../../hooks/details/useDetailsUpdate';
import { Extpipe } from '../../model/Extpipe';
import { minutesToUnit, timeUnitToMinutesMultiplier } from '../../utils/utils';
import { ErrorMessage } from '../error/ErrorMessage';
import { InfoBox } from '../message/InfoBox';
import { EditModal } from '../modals/EditModal';
import { DivFlex, IconHeading, StyledLabel } from '../styled';

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
  const { t } = useTranslation();
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
    if (!extpipe) return;
    if (!Number.isFinite(value) || value <= 0) {
      setErrorMessage(t('notification-setting-err-invalid-time'));
      return;
    }
    const items = createUpdateSpec({
      id: extpipe.id,
      fieldValue: {
        allowedNotSeenRangeInMinutes:
          value * timeUnitToMinutesMultiplier[timeUnit],
      },
      fieldName: 'notificationConfig',
    });
    await mutate(items, {
      onError: () => {
        setErrorMessage(t('notification-setting-err'));
      },
      onSuccess: () => {
        close();
      },
    });
  };
  return (
    <EditModal
      width={700}
      title={t('notification-setting')}
      visible={isOpen}
      close={close}
    >
      <IconHeading icon="BellFilled">{t('run-alerts')}</IconHeading>
      <p> {t('run-alerts-info')}</p>
      <Hr />
      <IconHeading icon="BellFilled">{t('last-seen-status')}</IconHeading>
      <p>{t('last-seen-alerts-info')}</p>
      <StyledLabel htmlFor="time-amount-input">
        {t('no-activity-alert')}
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
          {t('no-contact-added-desc')}
        </InfoBox>
      ) : (
        <InfoBox iconType="InfoFilled">{t('add-contact-info')}</InfoBox>
      )}
      <DivFlex justify="flex-end" css="gap: 0.5rem; margin-top: 1rem">
        <Button type="ghost" onClick={close}>
          {t('cancel')}
        </Button>
        <Button type="primary" onClick={onConfirm}>
          {t('confirm')}
        </Button>
      </DivFlex>
    </EditModal>
  );
};

const Hr = styled.hr`
  border: 0;
  border-bottom: 1px solid #ddd;
  margin: 1.5rem 0;
`;
