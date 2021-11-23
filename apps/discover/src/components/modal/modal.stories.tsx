import { useState } from 'react';

import { Button } from '@cognite/cogs.js';

import { Modal, OKModal, BlankModal, ActionModal } from '.';

export default {
  title: 'Components / modal',
  component: Modal,
};

export const basic = () => {
  const [isOpen, setIsOpen] = useState(false);
  const toggleIsOpen = () => setIsOpen(!isOpen);

  return (
    <>
      <Button onClick={toggleIsOpen} aria-label="Open modal">
        Open default modal
      </Button>
      <Modal
        visible={isOpen}
        title="Modal"
        onCancel={toggleIsOpen}
        onOk={toggleIsOpen}
        halfWidth
      >
        This is the Modal component, which has a Cancel and an OK button.
      </Modal>
    </>
  );
};

export const withOkButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const toggleIsOpen = () => setIsOpen(!isOpen);

  return (
    <>
      <Button onClick={toggleIsOpen} aria-label="Open modal">
        Open OK modal
      </Button>
      <OKModal
        visible={isOpen}
        title="OKModal"
        onOk={toggleIsOpen}
        onCancel={toggleIsOpen}
      >
        This is the OKModal component, which has one button.
      </OKModal>
    </>
  );
};

export const withoutButtons = () => {
  const [isOpen, setIsOpen] = useState(false);
  const toggleIsOpen = () => setIsOpen(!isOpen);

  return (
    <>
      <Button onClick={toggleIsOpen} aria-label="Open modal">
        Open blank modal
      </Button>
      <BlankModal visible={isOpen} title="BlankModal" onCancel={toggleIsOpen}>
        This is the Modal component, which has no buttons.
      </BlankModal>
    </>
  );
};

export const withActions = () => {
  const [isOpen, setIsOpen] = useState(false);
  const toggleIsOpen = () => setIsOpen(!isOpen);

  return (
    <>
      <Button onClick={toggleIsOpen} aria-label="Open modal">
        Open action modal
      </Button>
      <ActionModal
        visible={isOpen}
        title="ActionModal"
        onCancel={toggleIsOpen}
        halfWidth
        actions={[
          {
            icon: 'Download',
            title: 'Download file',
            onClick: toggleIsOpen,
          },
          {
            icon: 'Camera',
            title: 'Upload photo',
            onClick: toggleIsOpen,
          },
          {
            icon: 'BarChart',
            title: 'View data',
            onClick: toggleIsOpen,
          },
        ]}
      >
        This is the Modal component, which can have many actions.
      </ActionModal>
    </>
  );
};
