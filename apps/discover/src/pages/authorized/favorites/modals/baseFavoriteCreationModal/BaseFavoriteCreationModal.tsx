import React, { useState, useEffect, KeyboardEvent } from 'react';

import styled from 'styled-components/macro';

import { Input } from '@cognite/cogs.js';

import { Modal } from 'components/Modal';
import { useTranslation } from 'hooks/useTranslation';
import { FavoriteSummary } from 'modules/favorite/types';
import {
  CREATE_SET_MODAL_DESCRIPTION_LABEL,
  CREATE_SET_MODAL_DESCRIPTION_PLACEHOLDER,
  CREATE_SET_MODAL_TITLE_LABEL,
  CREATE_SET_MODAL_TITLE_PLACEHOLDER,
} from 'pages/authorized/favorites/constants';
import { FlexColumn } from 'styles/layout';

import { isEnterPressed } from '../../../../../utils/general.helper';

const CreateSetModal = styled(Modal)`
  background: var(--cogs-white);
  & .cogs-modal-content {
    padding: 0px;
  }
`;

const ContentWrapper = styled.div`
  & .cogs-input-container .title {
    color: var(--cogs-greyscale-grey9);
    font-family: Inter;
    font-style: normal;
    font-weight: 500;
    font-size: 14px;
  }
`;

export interface Props {
  isOpen: boolean;
  item?: FavoriteSummary;
  title?: string;
  name?: string;
  okText?: string;
  description?: string;
  handleTextChanged: (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  handleOnConfirm?: () => void;
  handleOnClose?: () => void;
  // showShareOptions?: boolean;
}

/**
 * This is a base component for ""Creating favourites". It's used by "Create new favourite" and "Duplicate favourite set" components.
 *
 */
const BaseFavoriteCreationModal: React.FC<Props> = ({
  isOpen,
  item,
  title,
  name,
  okText,
  description,
  handleTextChanged,
  handleOnConfirm,
  handleOnClose,
}) => {
  const [okDisabled, setOkDisabled] = useState<boolean>(name === '');
  const { t } = useTranslation();

  // Handle disable the OK button
  useEffect(() => {
    setOkDisabled(
      (name === item?.name && description === item?.description) || name === ''
    );
  }, [name, description]);

  const handleKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
    if (isEnterPressed(event)) {
      if (!okDisabled && handleOnConfirm) {
        handleOnConfirm();
      }
    }
  };

  return (
    <CreateSetModal
      visible={isOpen}
      onCancel={handleOnClose}
      onOk={handleOnConfirm}
      okText={okText || t('Create')}
      title={title}
      okDisabled={okDisabled}
      fourthWidth
    >
      <ContentWrapper>
        <FlexColumn>
          <Input
            id="create-favourite-name"
            name="name"
            placeholder={t(CREATE_SET_MODAL_TITLE_PLACEHOLDER)}
            title={t(CREATE_SET_MODAL_TITLE_LABEL)}
            value={name}
            onChange={handleTextChanged}
            data-testid="create-favourite-name"
            onKeyPress={handleKeyPress}
          />
          <Input
            id="create-favourite-description"
            name="description"
            placeholder={t(CREATE_SET_MODAL_DESCRIPTION_PLACEHOLDER)}
            title={t(CREATE_SET_MODAL_DESCRIPTION_LABEL)}
            rows={5}
            value={description}
            onChange={handleTextChanged}
            data-testid="create-favourite-description"
            onKeyPress={handleKeyPress}
          />
        </FlexColumn>
      </ContentWrapper>
    </CreateSetModal>
  );
};

export default BaseFavoriteCreationModal;
