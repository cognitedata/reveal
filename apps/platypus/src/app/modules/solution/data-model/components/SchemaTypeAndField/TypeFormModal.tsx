import { Input, InputProps } from '@cognite/cogs.js';
import { ModalDialog } from '@platypus-app/components/ModalDialog/ModalDialog';
import { useTranslation } from '@platypus-app/hooks/useTranslation';
import {
  DataModelTypeDefsType,
  DataModelTypeNameValidator,
} from '@platypus/platypus-core';
import { useController, useForm, SubmitHandler } from 'react-hook-form';

type FormInput = {
  typeName: string;
};

type BaseModalProps = {
  visible: boolean;
  closeModal: () => void;
  onOk: (typeName: string) => void;
  typeValue: string;
  mode: string;
  existingTypes: DataModelTypeDefsType[];
};

export const TypeFormModal = ({
  onOk,
  mode,
  visible,
  typeValue: defaultValue,
  closeModal,
  existingTypes,
}: BaseModalProps) => {
  const { t } = useTranslation('type_modal');
  const label =
    {
      create: t('add_type', 'Add Type'),
      rename: t('rename_type', 'Rename Type'),
    }[mode] || '';
  const {
    formState: { errors },
    handleSubmit,
    control,
    reset,
  } = useForm<FormInput>({
    mode: 'onChange',
    reValidateMode: 'onChange',
  });
  const typeNameValidator = new DataModelTypeNameValidator();
  const validateTypeNameIsUnique = (value: string): string | true => {
    if (existingTypes.some((type) => type.name === value)) {
      return t('not_unique_error', `Type '${value}' already exists`);
    }
    return true;
  };

  const validateTypeNameHasValidChars = (value: string): string | true => {
    const validationResult = typeNameValidator.validate('Type name', value);
    return (
      validationResult.valid ||
      t(
        'invalid_name_error',
        validationResult.errors['Type name'] || 'Invalid type name'
      )
    );
  };

  const { field } = useController({
    control,
    defaultValue,
    name: 'typeName',
    rules: {
      required: 'This field is required',
      validate: { validateTypeNameHasValidChars, validateTypeNameIsUnique },
    },
  });

  const onSubmit: SubmitHandler<FormInput> = (data) => {
    if (data.typeName) {
      closeModal();
      onOk(data.typeName);
      reset({
        typeName: '',
      });
    }
  };
  return (
    <ModalDialog
      title={label}
      okType="primary"
      okButtonName={label}
      onOk={handleSubmit(onSubmit)}
      visible={visible}
      onCancel={closeModal}
    >
      <Input
        {...(field as Partial<InputProps>)}
        ref={null}
        error={errors.typeName?.message}
        title="Type name"
        fullWidth
        data-cy="type-name-input"
        autoFocus
        css={{}}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleSubmit(onSubmit)();
          }
        }}
        placeholder={t('modal_name_input_placeholder', 'Enter name')}
      />
    </ModalDialog>
  );
};
