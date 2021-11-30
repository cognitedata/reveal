import React, { FunctionComponent, PropsWithChildren, useState } from 'react';
import { FieldWrapper } from 'components/extpipe/fields/FieldVerticalDisplay';
import { StyledLabel } from 'styles/StyledForm';
import { AddFieldValueBtn } from 'components/buttons/AddFieldValueBtn';
import { NotificationDialog } from 'components/extpipe/NotificationDialog';
import { Extpipe } from 'model/Extpipe';
import { Section } from 'components/extpipe/Section';

type NotificationSectionProps = {
  canEdit: boolean;
  extpipe: Extpipe;
};

export const NotificationSection: FunctionComponent<NotificationSectionProps> = ({
  canEdit,
  extpipe,
}: PropsWithChildren<NotificationSectionProps>) => {
  const [open, setOpen] = useState(false);
  return (
    <Section icon="BellNotification" title="Notifications">
      <FieldWrapper>
        <StyledLabel htmlFor="nothing">Notifications</StyledLabel>
      </FieldWrapper>

      <AddFieldValueBtn canEdit={canEdit} onClick={() => setOpen(true)}>
        notification
      </AddFieldValueBtn>

      <NotificationDialog
        extpipe={extpipe}
        isOpen={open}
        close={() => setOpen(false)}
      />
    </Section>
  );
};
