import React, { FunctionComponent, PropsWithChildren, useState } from 'react';
import { FieldWrapper } from 'components/extpipe/fields/FieldVerticalDisplay';
import { StyledLabel } from 'components/styled';
import { AddFieldValueBtn } from 'components/buttons/AddFieldValueBtn';
import {
  minutesToUnit,
  NotificationDialog,
} from 'components/extpipe/NotificationDialog';
import { Extpipe } from 'model/Extpipe';
import { Section } from 'components/extpipe/Section';

type NotificationSectionProps = {
  canEdit: boolean;
  extpipe: Extpipe;
};

function renderTime(minutes: number) {
  const t = minutesToUnit(minutes);
  const unit = t.n === 1 ? t.unit.slice(0, -1) : t.unit;
  return (
    <span>
      {t.n} {unit}
    </span>
  );
}

export const NotificationSection: FunctionComponent<
  NotificationSectionProps
> = ({ canEdit, extpipe }: PropsWithChildren<NotificationSectionProps>) => {
  const [open, setOpen] = useState(false);
  const openDialog = () => setOpen(true);
  return (
    <Section
      icon="Bell"
      title="Notifications"
      editButton={{ canEdit, onClick: openDialog }}
    >
      <FieldWrapper>
        <StyledLabel htmlFor="nothing">Notification settings</StyledLabel>
      </FieldWrapper>

      {extpipe.notificationConfig == null ||
      extpipe.notificationConfig.allowedNotSeenRangeInMinutes == null ? (
        <AddFieldValueBtn canEdit={canEdit} onClick={openDialog}>
          notification
        </AddFieldValueBtn>
      ) : (
        <FieldWrapper>
          <div>
            Sends alerts{' '}
            {renderTime(
              extpipe.notificationConfig.allowedNotSeenRangeInMinutes
            )}{' '}
            after no detected activity.
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
