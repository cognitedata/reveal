import { useEffect, useState } from 'react';
import { toast } from '@cognite/cogs.js';
import { useAppContext, useDataElementConfig } from 'scarlet/hooks';
import { AppActionType, DataElement, DataElementState } from 'scarlet/types';

import { Modal } from '../..';

type ApproveModalProps = {
  visible: boolean;
  dataElement?: DataElement;
  onClose: () => void;
};

export const ApproveModal = ({
  visible,
  dataElement,
  onClose,
}: ApproveModalProps) => {
  const { appState, appDispatch } = useAppContext();
  const [loading, setLoading] = useState(false);
  const dataElementConfig = useDataElementConfig(dataElement);

  useEffect(() => {
    if (!visible) return;

    if (appState.saveState.error) {
      toast.error(`Failed to approve "${dataElementConfig?.label}"`);
      console.error(
        `Failed to approve "${dataElementConfig?.label}"`,
        appState.saveState.error
      );
    }

    if (loading && !appState.saveState.loading) {
      setLoading(false);
      if (!appState.saveState.error) {
        toast.success(`"${dataElementConfig?.label}" is approved`);
        onClose();
      }
    }
  }, [appState.saveState]);

  const onApprove = () => {
    setLoading(true);
    appDispatch({
      type: AppActionType.UPDATE_DATA_ELEMENT_STATE,
      dataElement: dataElement!,
      state: DataElementState.APPROVED,
    });
  };

  return (
    <Modal
      title="Accept value?"
      description="You won&rsquo;t be able to modify fields with accepted values."
      okText="Yes, Accept"
      visible={visible}
      onOk={onApprove}
      onCancel={!loading ? onClose : () => null}
      loading={loading}
    />
  );
};
