import React, { FunctionComponent, PropsWithChildren, useState } from 'react';
import { FieldWrapper } from 'components/extpipe/fields/FieldVerticalDisplay';
import { StyledLabel } from 'styles/StyledForm';
import { AddFieldValueBtn } from 'components/buttons/AddFieldValueBtn';
import { NotificationDialog } from 'components/extpipe/NotificationDialog';
import { Extpipe } from 'model/Extpipe';

type NotificationSettingsProps = {
  canEdit: boolean;
  extpipe: Extpipe;
};

export const NotificationSettings: FunctionComponent<NotificationSettingsProps> = ({
  canEdit,
  extpipe,
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

      <NotificationDialog
        extpipe={extpipe}
        isOpen={open}
        close={() => setOpen(false)}
      />
    </>
  );
};
