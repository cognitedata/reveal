import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { Flex, Modal, InputExp } from '@cognite/cogs.js';
import { CANVAS_PATH, useTranslation } from 'common';
import { useCreateFlow } from 'hooks/files';
import { useNavigate } from 'react-router-dom';
import { createLink } from '@cognite/cdf-utilities';

type Props = {
  showWorkflowModal: boolean;
  setShowWorkflowModal: Dispatch<SetStateAction<boolean>>;
};

export const WorkflowModal = ({
  showWorkflowModal,
  setShowWorkflowModal,
}: Props) => {
  const [name, setName] = useState('');
  const [externalId, setExternalId] = useState('');
  const [description, setDescription] = useState('');
  const [idChanged, setIdChanged] = useState(false);

  const { t } = useTranslation();
  const { mutateAsync, isLoading: isCreateLoading } = useCreateFlow();
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

  return (
    <Modal
      onCancel={() => setShowWorkflowModal(!showWorkflowModal)}
      cancelText={t('cancel')}
      okText={t('create')}
      onOk={handleCreate}
      okDisabled={!name && !externalId}
      title={t('create-flow')}
      visible={showWorkflowModal}
    >
      <Flex direction="column" gap={10}>
        <InputExp
          label={t('name')}
          disabled={isCreateLoading}
          placeholder={t('enter-name')}
          value={name}
          onChange={handleNameChange}
        />
        <InputExp
          label={t('external-id')}
          disabled={isCreateLoading}
          placeholder={t('enter-external-id')}
          value={externalId}
          onChange={handleidChange}
        />
        <InputExp
          label={t('description')}
          disabled={isCreateLoading}
          placeholder={t('enter-description')}
          value={description}
          onChange={(e: any) => setDescription(e.target.value)}
        />
      </Flex>
    </Modal>
  );
};

export default WorkflowModal;
