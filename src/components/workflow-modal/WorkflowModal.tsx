import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { Flex, InputExp, Modal } from '@cognite/cogs.js';
import { CANVAS_PATH, useTranslation } from 'common';
import { useCreateFlow, useFlow, useUpdateFlow } from 'hooks/files';
import { useNavigate, useParams } from 'react-router-dom';
import { createLink } from '@cognite/cdf-utilities';
import { useWorkflowBuilderContext } from 'contexts/WorkflowContext';

type Props = {
  type?: 'create' | 'update';
  showWorkflowModal: boolean;
  setShowWorkflowModal: Dispatch<SetStateAction<boolean>>;
};

const WorkflowModal = ({
  type,
  showWorkflowModal,
  setShowWorkflowModal,
}: Props) => {
  const [values, setValues] = useState({
    name: '',
    id: '', // Using id rather than externalId because data contains id. Need 'id' for handleIsUserEditing()
    description: '',
  });
  const { id } = useParams<{ id: string }>();
  const [idChanged, setIdChanged] = useState(false);
  const [isUserEditing, setIsUserEditing] = useState(false);

  const { t } = useTranslation();
  const { mutateAsync, isLoading: isCreateLoading } = useCreateFlow();
  const { isLoading: isUpdateLoading } = useUpdateFlow();
  const { changeFlow } = useWorkflowBuilderContext();
  const { data } = useFlow(id ?? '');
  const navigate = useNavigate();

  const handleCreate = () =>
    mutateAsync({
      id: values.id,
      name: values.name,
      description: values.description,
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
        id: values.id,
        name: values.name,
        description: values.description,
      };
      f.id = newFlow.id;
      f.name = newFlow.name;
      f.description = newFlow.description;
    });
    setShowWorkflowModal(false);
  }, [
    changeFlow,
    setShowWorkflowModal,
    values.id,
    values.name,
    values.description,
  ]);

  // Only show tr- prefix if name is changed
  useEffect(() => {
    if (!idChanged) {
      setValues((prevValues) => ({
        ...prevValues,
        id:
          prevValues.name.length > 0
            ? `tr-${prevValues.name.toLowerCase().replace(/ /g, '-')}`
            : '',
      }));
    }
  }, [values.name, idChanged]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!idChanged) {
      setValues({
        ...values,
        name: e.target.value,
        id: `tr-${e.target.value.toLowerCase().replace(/ /g, '-')}`,
      });
      setIsUserEditing(true);
    } else {
      setValues({ ...values, name: e.target.value });
    }
  };

  const handleidChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues({ ...values, id: e.target.value });
    setIdChanged(
      e.target.value !== `tr-${values.name.toLowerCase().replace(/ /g, '-')}`
    );
  };

  const handleIsUserEditing = (valueType: 'name' | 'id' | 'description') => {
    if (type === 'create') {
      return values[valueType];
    } else {
      if (isUserEditing) {
        return values[valueType];
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
      okDisabled={!values.name && !values.id}
      title={type === 'create' ? t('create-flow') : t('general-info')}
      visible={showWorkflowModal}
    >
      <Flex direction="column" gap={10}>
        <InputExp
          label={t('name')}
          fullWidth
          disabled={type === 'create' ? isCreateLoading : isUpdateLoading}
          placeholder={t('enter-name')}
          value={handleIsUserEditing('name')}
          onChange={handleNameChange}
        />
        <InputExp
          label={t('external-id')}
          fullWidth
          disabled={'create' ? isCreateLoading : isUpdateLoading}
          placeholder={t('enter-external-id')}
          value={handleIsUserEditing('id')}
          onChange={handleidChange}
        />
        <InputExp
          label={t('description')}
          fullWidth
          disabled={'create' ? isCreateLoading : isUpdateLoading}
          placeholder={t('enter-description')}
          value={handleIsUserEditing('description')}
          onChange={(e) =>
            setValues({ ...values, description: e.target.value })
          }
        />
      </Flex>
    </Modal>
  );
};

export default WorkflowModal;
