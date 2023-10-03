import { useState } from 'react';

import { Body, Checkbox, Flex, Modal } from '@cognite/cogs.js';

type DeleteModalProps = {
  bodyText: string;
  checkboxText: string;
  onCancel: VoidFunction;
  onOk: VoidFunction;
  titleText: string;
  visible: boolean;
};

/** Show a modal with extra information for delete.
 * This modal requires the user to confirm the action of deletion. */
export const DeleteModal = ({
  bodyText,
  checkboxText,
  onCancel,
  onOk,
  titleText,
  visible,
}: DeleteModalProps) => {
  const [isConfirmed, setIsConfirmed] = useState(false);

  return (
    <Modal
      destructive
      visible={visible}
      okDisabled={!isConfirmed}
      okText="Delete"
      onOk={onOk}
      onCancel={onCancel}
      title={titleText}
    >
      <Flex direction="column" gap={16} style={{ overflow: 'hidden' }}>
        <Body size="medium">{bodyText}</Body>
        <Checkbox
          checked={isConfirmed}
          name="confirmDelete"
          onChange={(e) => setIsConfirmed(e.target.checked)}
          label={checkboxText}
        />
      </Flex>
    </Modal>
  );
};
