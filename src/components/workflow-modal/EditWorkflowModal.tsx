import {
  ChangeEvent,
  Dispatch,
  SetStateAction,
  useCallback,
  useState,
} from 'react';
import { Flex, Modal } from '@cognite/cogs.js';
import { useTranslation } from 'common';
import { useFlow, useUpdateFlow } from 'hooks/files';
import { useParams } from 'react-router-dom';
import FormFieldInput from 'components/form-field-input';
import { useWorkflowBuilderContext } from 'contexts/WorkflowContext';

type Props = {
  showWorkflowModal: boolean;
  setShowWorkflowModal: Dispatch<SetStateAction<boolean>>;
};

export const WorkflowModal = ({
  showWorkflowModal,
  setShowWorkflowModal,
}: Props) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const { id } = useParams<{ id: string }>();
  const [nameChanged, setNameChanged] = useState(false);
  const [descriptionChanged, setDescriptionChanged] = useState(false);

  const { t } = useTranslation();
  const { isLoading: isUpdateLoading } = useUpdateFlow();
  const { changeFlow } = useWorkflowBuilderContext();
  const { data } = useFlow(id ?? '');

  const handleUpdate = useCallback(() => {
    changeFlow((f) => {
      const newFlow = { name: '', description: '' };
      if (nameChanged) {
        newFlow.name = name;
      } else {
        newFlow.name = data?.name ?? '';
      }
      if (descriptionChanged) {
        newFlow.description = description;
      } else {
        newFlow.description = data?.description ?? '';
      }
      f.name = newFlow.name;
      f.description = newFlow.description;
    });
    setShowWorkflowModal(false);
  }, [
    changeFlow,
    setShowWorkflowModal,
    nameChanged,
    descriptionChanged,
    name,
    data?.name,
    data?.description,
    description,
  ]);

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    setNameChanged(true);
  };

  const handleDescriptionChange = (e: ChangeEvent<HTMLInputElement>) => {
    setDescription(e.target.value);
    setDescriptionChanged(true);
  };

  const handleIsUserEditing = (valueType: 'name' | 'description') => {
    if (valueType === 'name') {
      if (nameChanged) {
        return name;
      } else {
        return data?.[valueType];
      }
    } else {
      if (descriptionChanged) {
        return description;
      } else {
        return data?.[valueType];
      }
    }
  };

  return (
    <Modal
      onCancel={() => setShowWorkflowModal(!showWorkflowModal)}
      cancelText={t('cancel')}
      okText={t('save')}
      onOk={handleUpdate}
      okDisabled={!name}
      title={t('general-info')}
      visible={showWorkflowModal}
    >
      <Flex direction="column" gap={10}>
        <FormFieldInput
          title={t('name')}
          disabled={isUpdateLoading}
          placeholder={t('enter-name')}
          value={handleIsUserEditing('name')}
          onChange={handleNameChange}
        />
        <FormFieldInput
          title={t('description')}
          disabled={isUpdateLoading}
          placeholder={t('enter-description')}
          value={handleIsUserEditing('description')}
          onChange={handleDescriptionChange}
        />
      </Flex>
    </Modal>
  );
};

export default WorkflowModal;
