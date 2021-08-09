import { Button, Icon } from '@cognite/cogs.js';
import React, { FunctionComponent, PropsWithChildren, useState } from 'react';
import { Integration, IntegrationFieldName } from 'model/Integration';
import {
  useDetailsUpdate,
  createUpdateSpec,
} from 'hooks/details/useDetailsUpdate';
import { useAppEnv } from 'hooks/useAppEnv';
import styled from 'styled-components';
import { SERVER_ERROR_CONTENT, SERVER_ERROR_TITLE } from 'utils/constants';
import MessageDialog from 'components/buttons/MessageDialog';
import { removeContactByIdx } from 'utils/integrationUtils';

const RemoveBtn = styled(Button)`
  width: fit-content;
  justify-self: end;
`;
interface RemoveButtonProps {
  integration: Integration;
  name: IntegrationFieldName;
  index: number;
}

export const RemoveContactButton: FunctionComponent<RemoveButtonProps> = ({
  integration,
  index,
  name,
}: PropsWithChildren<RemoveButtonProps>) => {
  const [errorVisible, setErrorVisible] = useState(false);
  const { mutate } = useDetailsUpdate();
  const { project } = useAppEnv();

  const removeRow = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (integration && project) {
      const items = createUpdateSpec({
        project,
        id: integration.id,
        fieldValue: removeContactByIdx(integration.contacts, index),
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
    <MessageDialog
      visible={errorVisible}
      handleClickError={handleClickError}
      title={SERVER_ERROR_TITLE}
      contentText={SERVER_ERROR_CONTENT}
    >
      <RemoveBtn
        type="tertiary"
        aria-label={`Remove ${name} ${index}`}
        onClick={removeRow}
      >
        <Icon type="Trash" />
      </RemoveBtn>
    </MessageDialog>
  );
};
