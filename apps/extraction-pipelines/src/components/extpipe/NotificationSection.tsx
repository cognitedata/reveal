import React, { FunctionComponent, PropsWithChildren, useState } from 'react';
import { FieldWrapper } from 'components/extpipe/fields/FieldVerticalDisplay';
import { StyledLabel } from 'styles/StyledForm';
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
  return (
    <div>
      <span>{t.n}</span> <i>{t.unit}</i>
    </div>
  );
}

export const NotificationSection: FunctionComponent<NotificationSectionProps> = ({
  canEdit,
  extpipe,
}: PropsWithChildren<NotificationSectionProps>) => {
  const [open, setOpen] = useState(false);
  const openDialog = () => setOpen(true);
  return (
    <Section
      icon="BellNotification"
      title="Notifications"
      editButton={{ canEdit, onClick: openDialog }}
    >
      <FieldWrapper>
        <StyledLabel htmlFor="nothing">Notifications</StyledLabel>
      </FieldWrapper>

      {extpipe.notificationConfig == null ? (
        <AddFieldValueBtn canEdit={canEdit} onClick={openDialog}>
          notification
        </AddFieldValueBtn>
      ) : (
        <FieldWrapper>
          {renderTime(extpipe.notificationConfig.allowedNotSeenRangeInMinutes)}
        </FieldWrapper>
      )}

      <NotificationDialog
        extpipe={extpipe}
        isOpen={open}
        close={() => setOpen(false)}
      />
    </Section>
  );
};
