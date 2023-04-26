import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { Flex, InputExp, Modal } from '@cognite/cogs.js';
import { CANVAS_PATH, useTranslation } from 'common';
import { useCreateFlow } from 'hooks/files';
import { useNavigate } from 'react-router-dom';
import { createLink } from '@cognite/cdf-utilities';

type Props = {
  showCreateModal: boolean;
  setShowCreateModal: Dispatch<SetStateAction<boolean>>;
};

const CreateFlowModal = ({ showCreateModal, setShowCreateModal }: Props) => {
  const [values, setValues] = useState({
    name: '',
    externalId: '',
    description: '',
  });
  const [externalIdChanged, setExternalIdChanged] = useState(false);

  const { t } = useTranslation();
  const { mutateAsync, isLoading } = useCreateFlow();
  const navigate = useNavigate();
  const handleSubmit = () =>
    mutateAsync({
      id: values.externalId,
      name: values.name,
      description: values.description,
      canvas: {
        nodes: [] as any, // FIXME: any
        edges: [] as any, // FIXME: any
      },
    }).then((fileInfo) => {
      navigate(createLink(`/${CANVAS_PATH}/${fileInfo.externalId}`));
    });

  // Only show tr- prefix if name is changed
  useEffect(() => {
    if (!externalIdChanged) {
      setValues({
        ...values,
        externalId:
          values.name.length > 0
            ? `tr-${values.name.toLowerCase().replace(/ /g, '-')}`
            : '',
      });
    }
  }, [values.name, externalIdChanged, values]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!externalIdChanged) {
      setValues({
        ...values,
        name: e.target.value,
        externalId: `tr-${e.target.value.toLowerCase().replace(/ /g, '-')}`,
      });
    } else {
      setValues({ ...values, name: e.target.value });
    }
  };

  const handleExternalIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues({ ...values, externalId: e.target.value });
    setExternalIdChanged(
      e.target.value !== `tr-${values.name.toLowerCase().replace(/ /g, '-')}`
    );
  };

  return (
    <Modal
      onCancel={() => setShowCreateModal(!showCreateModal)}
      cancelText={t('cancel')}
      okText={t('create')}
      onOk={() => handleSubmit()}
      okDisabled={!values.name && !values.externalId}
      title="Create flow"
      visible={showCreateModal}
    >
      <Flex direction="column" gap={10}>
        <InputExp
          label={t('name')}
          fullWidth
          disabled={isLoading}
          placeholder={t('enter-name')}
          value={values.name}
          onChange={handleNameChange}
        />
        <InputExp
          label={t('external-id')}
          fullWidth
          disabled={isLoading}
          placeholder={t('enter-external-id')}
          value={values.externalId}
          onChange={handleExternalIdChange}
        />
        <InputExp
          label={t('description')}
          fullWidth
          disabled={isLoading}
          placeholder={t('enter-description')}
          value={values.description}
          onChange={(e) =>
            setValues({ ...values, description: e.target.value })
          }
        />
      </Flex>
    </Modal>
  );
};

export default CreateFlowModal;
