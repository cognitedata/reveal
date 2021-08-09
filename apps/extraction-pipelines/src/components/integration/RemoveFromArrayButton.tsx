import { Button } from '@cognite/cogs.js';
import React, { FunctionComponent, PropsWithChildren, useState } from 'react';
import { IntegrationFieldName } from 'model/Integration';
import {
  DetailsUpdateContext,
  useDetailsUpdate,
} from 'hooks/details/useDetailsUpdate';
import styled from 'styled-components';
import { SERVER_ERROR_CONTENT, SERVER_ERROR_TITLE } from 'utils/constants';
import MessageDialog from 'components/buttons/MessageDialog';

const RemoveBtn = styled(Button)`
  width: fit-content;
  justify-self: end;
`;
interface RemoveButtonProps {
  name: IntegrationFieldName;
  index: number;
  updateFunction: () => DetailsUpdateContext;
}

export const RemoveFromArrayButton: FunctionComponent<RemoveButtonProps> = ({
  index,
  name,
  updateFunction,
}: PropsWithChildren<RemoveButtonProps>) => {
  const [errorVisible, setErrorVisible] = useState(false);
  const { mutate } = useDetailsUpdate();

  const removeRow = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const items = updateFunction();
    await mutate(items, {
      onError: () => {
        setErrorVisible(true);
      },
    });
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
        icon="Trash"
        aria-label={`Remove ${name} ${index}`}
        onClick={removeRow}
      />
    </MessageDialog>
  );
};
