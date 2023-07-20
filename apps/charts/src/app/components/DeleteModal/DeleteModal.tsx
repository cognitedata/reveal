import { PropsWithChildren } from 'react';

import { makeDefaultTranslations } from '@charts-app/utils/translations';

import { Modal } from '@cognite/cogs.js';

type Props = {
  visible: boolean;
  onOk: () => Promise<void>;
  onCancel: () => void;
  title: string;
  translations?: Record<string, string>;
};

const defaultTarnslations = makeDefaultTranslations('Cancel', 'Delete');

export const DeleteModal = ({
  visible,
  onOk,
  onCancel,
  title,
  translations,
  children,
}: PropsWithChildren<Props>) => {
  const t = { ...defaultTarnslations, ...translations };

  return (
    <Modal
      visible={visible}
      icon="Delete"
      title={title}
      onCancel={onCancel}
      onOk={onOk}
      cancelText={t.Cancel}
      destructive
      okText={t.Delete}
    >
      {children}
    </Modal>
  );
};
