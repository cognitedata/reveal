import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { Flex, Modal } from '@cognite/cogs.js';
import { CANVAS_PATH, useTranslation } from 'common';
import { useCreateFlow, useFlow, useUpdateFlow } from 'hooks/files';
import { useNavigate, useParams } from 'react-router-dom';
import { createLink } from '@cognite/cdf-utilities';
import FormFieldInput from 'components/form-field-input';
import { useWorkflowBuilderContext } from 'contexts/WorkflowContext';

type Props = {
  type?: 'create' | 'update';
  showWorkflowModal: boolean;
  setShowWorkflowModal: Dispatch<SetStateAction<boolean>>;
};

// type WorkFlowModalTypes = {
//   externalId: string;
//   name: string;
//   description: string;
//   type: 'create' | 'update';
// };

const WorkflowModal = ({
  type,
  showWorkflowModal,
  setShowWorkflowModal,
}: Props) => {
  const [name, setName] = useState('');
  const [externalId, setExternalId] = useState('');
  const [description, setDescription] = useState('');

  const { id } = useParams<{ id: string }>();
  const [idChanged, setIdChanged] = useState(false);
  const [isUserEditing, setIsUserEditing] = useState(false);

  const { t } = useTranslation();
  const { mutateAsync, isLoading: isCreateLoading } = useCreateFlow();
  const { isLoading: isUpdateLoading } = useUpdateFlow();
  const context = useWorkflowBuilderContext();
  const { changeFlow } = context;
  const { data } = useFlow(id ?? '');
  const navigate = useNavigate();

  const handleCreate = () =>
    mutateAsync({
      id: externalId,
      name: name,
      description: description,
      canvas: {
        nodes: [] as any, // FIXME: any
        edges: [] as any, // FIXME: any
      },
    }).then((fileInfo) => {
      navigate(createLink(`/${CANVAS_PATH}/${fileInfo.id}`));
    });

  const handleUpdate = useCallback(() => {
    changeFlow((f) => {
      const newFlow = {
        name: name,
        description: description,
      };
      f.name = newFlow.name;
      f.description = newFlow.description;
    });
    setShowWorkflowModal(false);
  }, [changeFlow, setShowWorkflowModal, name, description]);

  // Only show tr- prefix if name is changed
  useEffect(() => {
    if (!idChanged) {
      setExternalId(
        name.length > 0 ? `tr-${name.toLowerCase().replace(/ /g, '-')}` : ''
      );
    }
  }, [name, idChanged]);

  const handleNameChange = (e: any) => {
    if (!idChanged) {
      setName(e.target.value);
      setExternalId(`tr-${e.target.value.toLowerCase().replace(/ /g, '-')}`);
      setIsUserEditing(true);
    } else {
      setName(e.target.value);
    }
  };

  const handleidChange = (e: any) => {
    setExternalId(e.target.value);
    setIdChanged(
      e.target.value !== `tr-${name.toLowerCase().replace(/ /g, '-')}`
    );
  };

  const handleIsUserEditing = (valueType: 'name' | 'description') => {
    if (type === 'create') {
      if (valueType === 'name') {
        return name;
      } else {
        return description;
      }
    } else {
      if (isUserEditing) {
        if (valueType === 'name') {
          return name;
        } else {
          return description;
        }
      } else {
        return data?.[valueType];
      }
    }
  };

  return (
    <Modal
      onCancel={() => setShowWorkflowModal(!showWorkflowModal)}
      cancelText={t('cancel')}
      okText={type === 'create' ? t('create') : t('save')}
      onOk={type === 'create' ? handleCreate : handleUpdate}
      okDisabled={!name && !externalId}
      title={type === 'create' ? t('create-flow') : t('general-info')}
      visible={showWorkflowModal}
    >
      <Flex direction="column" gap={10}>
        <FormFieldInput
          title={t('name')}
          disabled={type === 'create' ? isCreateLoading : isUpdateLoading}
          placeholder={t('enter-name')}
          value={handleIsUserEditing('name')}
          onChange={handleNameChange}
        />
        {type === 'create' && (
          <FormFieldInput
            title={t('external-id')}
            disabled={'create' ? isCreateLoading : isUpdateLoading}
            placeholder={t('enter-external-id')}
            value={externalId}
            onChange={handleidChange}
          />
        )}
        <FormFieldInput
          title={t('description')}
          disabled={'create' ? isCreateLoading : isUpdateLoading}
          placeholder={t('enter-description')}
          value={handleIsUserEditing('description')}
          onChange={(e: any) => setDescription(e.target.value)}
        />
      </Flex>
    </Modal>
  );
};

export default WorkflowModal;
