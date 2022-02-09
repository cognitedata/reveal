import { useEffect, useState } from 'react';
import { toast, Textarea } from '@cognite/cogs.js';
import { useAppContext, useDataElementConfig } from 'scarlet/hooks';
import { AppActionType, DataElement, DataElementState } from 'scarlet/types';

import { Modal } from '../..';

type OmitModalProps = {
  visible: boolean;
  dataElement?: DataElement;
  onClose: () => void;
};

export const OmitModal = ({
  visible,
  dataElement,
  onClose: propsOnClose,
}: OmitModalProps) => {
  const { appState, appDispatch } = useAppContext();
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const dataElementConfig = useDataElementConfig(dataElement);

  useEffect(() => {
    if (!visible) return;

    if (appState.saveState.error) {
      toast.error(`Failed to omit "${dataElementConfig?.label}"`);
      console.error(
        `Failed to omit "${dataElementConfig?.label}"`,
        appState.saveState.error
      );
    }

    if (loading && !appState.saveState.loading) {
      setLoading(false);
      if (!appState.saveState.error) {
        toast.success(`"${dataElementConfig?.label}" is omitted`);
        onClose();
      }
    }
  }, [appState.saveState]);

  const onOmit = () => {
    setLoading(true);
    appDispatch({
      type: AppActionType.UPDATE_DATA_ELEMENT_STATE,
      dataElement: dataElement!,
      state: DataElementState.OMITTED,
      stateReason: reason,
    });
  };

  const onClose = () => {
    setReason('');
    propsOnClose();
  };

  return (
    <Modal
      title="Ignore field?"
      description="Ignored fields would be omitted from data export."
      okText="Yes, Ignore"
      visible={visible}
      onOk={onOmit}
      onCancel={!loading ? onClose : () => null}
      loading={loading}
    >
      <Textarea
        value={reason}
        resize={false}
        rows={5}
        placeholder="Leave comment here"
        onChange={(e) => {
          setReason(e.target.value);
        }}
      />
    </Modal>
  );
};
