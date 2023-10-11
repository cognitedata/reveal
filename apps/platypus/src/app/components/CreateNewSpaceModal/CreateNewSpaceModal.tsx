import { useState } from 'react';

import { Validator } from '@platypus/platypus-core';
import { SpaceIdValidator } from '@platypus-core/domain/data-model/validators/space-id-validator';

import { Input, Modal } from '@cognite/cogs.js';

import { useTranslation } from '../../hooks/useTranslation';
import { FormLabel } from '../FormLabel/FormLabel';

import { NameWrapper } from './elements';

export type CreateNewSpaceModalProps = {
  onCancel: () => void;
  onSubmit: (newSpace: string) => void;
  visible: boolean;
};

export const CreateNewSpaceModal = (props: CreateNewSpaceModalProps) => {
  const { t } = useTranslation('CreateNewSpaceModal');
  const [spaceName, setSpaceName] = useState('');
  const [spaceNameError, setSpaceNameError] = useState('');

  const handleSubmit = () => {
    props.onSubmit(spaceName);
  };

  const validateName = (value: string) => {
    const validator = new Validator({ name: value });
    validator.addRule(
      'name',
      new SpaceIdValidator({
        validationMessage: t(
          'space_id_not_valid_message',
          'May only contain numbers, letters, hyphens and underscores. Cannot start with a number, or contain more than 43 characters'
        ),
      })
    );
    const result = validator.validate();
    setSpaceNameError(result.valid ? '' : result.errors.name);

    return result.valid;
  };

  return (
    <Modal
      visible={props.visible}
      title={t('create_space_modal_title', 'Create new space')}
      onCancel={() => props.onCancel()}
      onOk={handleSubmit}
      okDisabled={!!spaceNameError || !spaceName}
      okText={t('create_space_modal_confirm_button', 'Confirm')}
    >
      <div>
        <label>
          <FormLabel level={2} strong required>
            {t('modal_space_title', 'Space name')}
          </FormLabel>
          <NameWrapper>
            <Input
              fullWidth
              autoFocus
              name="dataModelSpace"
              data-cy="input-data-model-space"
              value={spaceName}
              placeholder={t('modal_space_input_placeholder', 'Enter name')}
              onChange={(e) => {
                validateName(e.currentTarget.value);
                setSpaceName(e.currentTarget.value);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && spaceNameError === '') {
                  handleSubmit();
                }
              }}
              error={spaceNameError || false}
            />
          </NameWrapper>
        </label>
      </div>
    </Modal>
  );
};
