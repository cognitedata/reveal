import { Input, Modal } from '@cognite/cogs.js';
import { useState } from 'react';
import { useTranslation } from '@platypus-app/hooks/useTranslation';
import { NameWrapper } from './elements';
import { Validator } from '@platypus/platypus-core';
import { DataModelNameValidator } from '@platypus-core/domain/data-model/validators/data-model-name-validator';
import { FormLabel } from '../FormLabel/FormLabel';

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
      new DataModelNameValidator({
        validationMessage: t(
          'space_name_error_message',
          'May only contain numbers, letters, hyphens and underscores. Cannot start with a number, or contain more than 43 characters.'
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
                setSpaceName(e.currentTarget.value);
                validateName(e.currentTarget.value);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
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
