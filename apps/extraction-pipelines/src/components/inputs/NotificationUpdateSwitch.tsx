import React, { PropsWithChildren, useState } from 'react';
import { Integration, IntegrationFieldName } from 'model/Integration';
import { FieldValues } from 'react-hook-form';
import { DefaultValues } from 'react-hook-form/dist/types/form';
import { useAppEnv } from 'hooks/useAppEnv';
import {
  createUpdateSpec,
  useDetailsUpdate,
} from 'hooks/details/useDetailsUpdate';
import MessageDialog from 'components/buttons/MessageDialog';
import { SERVER_ERROR_CONTENT, SERVER_ERROR_TITLE } from 'utils/constants';
import { SwitchButton } from 'styles/StyledButton';
import { updateContactField } from 'utils/integrationUtils';

interface TestProps<Fields> {
  name: IntegrationFieldName;
  field: string;
  index: number;
  defaultValues: DefaultValues<Fields>;
  integration: Integration;
}

export const NotificationUpdateSwitch = <Fields extends FieldValues>({
  integration,
  name,
  field,
  index,
  defaultValues,
}: PropsWithChildren<TestProps<Fields>>) => {
  const { project } = useAppEnv();
  const { mutate } = useDetailsUpdate();
  const [errorVisible, setErrorVisible] = useState(false);

  const handleClick = async () => {
    if (integration && project) {
      const updatedContacts = updateContactField(
        integration.contacts,
        'sendNotification',
        index
      );
      const items = createUpdateSpec({
        project,
        id: integration.id,
        fieldValue: updatedContacts,
        fieldName: name,
      });
      await mutate(items, {
        onError: () => {
          setErrorVisible(true);
        },
      });
    }
  };

  const handleClickError = () => {
    setErrorVisible(false);
  };

  return (
    <>
      <MessageDialog
        visible={errorVisible}
        handleClickError={handleClickError}
        title={SERVER_ERROR_TITLE}
        contentText={SERVER_ERROR_CONTENT}
      >
        <SwitchButton
          id={`${name}${index}${field}`}
          role="switch"
          type="button"
          onClick={() => handleClick()}
          aria-checked={defaultValues[field] ?? false}
          aria-labelledby="integration-contacts-notification-label"
          aria-describedby={`${field}-hint ${field}-error`}
        >
          <span className="on">On</span>
          <span className="off">Off</span>
        </SwitchButton>
      </MessageDialog>
    </>
  );
};
