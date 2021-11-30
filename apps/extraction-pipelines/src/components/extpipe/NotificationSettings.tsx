import React, { FunctionComponent, PropsWithChildren, useState } from 'react';
import { FieldWrapper } from 'components/extpipe/fields/FieldVerticalDisplay';
import { StyledLabel } from 'styles/StyledForm';
import { AddFieldValueBtn } from 'components/buttons/AddFieldValueBtn';
import { NotificationDialog } from 'components/extpipe/NotificationDialog';

type NotificationSettingsProps = {
  canEdit: boolean;
};

export const NotificationSettings: FunctionComponent<NotificationSettingsProps> = ({
  canEdit,
}: PropsWithChildren<NotificationSettingsProps>) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <FieldWrapper>
        <StyledLabel htmlFor="nothing">Notifications</StyledLabel>
      </FieldWrapper>

      <AddFieldValueBtn canEdit={canEdit} onClick={() => setOpen(true)}>
        notification
      </AddFieldValueBtn>

      <NotificationDialog isOpen={open} close={() => setOpen(false)} />
    </>
  );
};
