import React, { FunctionComponent, PropsWithChildren, useState } from 'react';
import { FieldWrapper } from 'components/extpipe/fields/FieldVerticalDisplay';
import { StyledLabel } from 'components/styled';
import { AddFieldValueBtn } from 'components/buttons/AddFieldValueBtn';
import { NotificationDialog } from 'components/extpipe/NotificationDialog';
import { Extpipe } from 'model/Extpipe';
import { Section } from 'components/extpipe/Section';
import { useTranslation } from 'common';
import { minutesToUnit } from 'utils/utils';

type NotificationSectionProps = {
  canEdit: boolean;
  extpipe: Extpipe;
};

function renderTime(minutes: number) {
  const time = minutesToUnit(minutes);
  const unit = time.n === 1 ? time.unit.slice(0, -1) : time.unit;
  return `${time.n} ${unit}`;
}

export const NotificationSection: FunctionComponent<
  NotificationSectionProps
> = ({ canEdit, extpipe }: PropsWithChildren<NotificationSectionProps>) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const openDialog = () => setOpen(true);
  return (
    <Section
      icon="Bell"
      title={t('notification', { count: 0 })}
      editButton={{ canEdit, onClick: openDialog }}
    >
      <FieldWrapper>
        <StyledLabel htmlFor="nothing">{t('notification-setting')}</StyledLabel>
      </FieldWrapper>

      {extpipe.notificationConfig == null ||
      extpipe.notificationConfig.allowedNotSeenRangeInMinutes == null ? (
        <AddFieldValueBtn canEdit={canEdit} onClick={openDialog}>
          {t('notification', { count: 1 })}
        </AddFieldValueBtn>
      ) : (
        <FieldWrapper>
          <div>
            {t('notification-alert-info', {
              duration: renderTime(
                extpipe.notificationConfig.allowedNotSeenRangeInMinutes
              ),
            })}
          </div>
        </FieldWrapper>
      )}

      {open && (
        <NotificationDialog
          extpipe={extpipe}
          isOpen={open}
          close={() => setOpen(false)}
        />
      )}
    </Section>
  );
};
