import { Body, Modal } from '@cognite/cogs.js';
import { ComponentProps, ReactNode } from 'react';

export const UnsavedChangesModal = (
  props: Omit<ComponentProps<typeof Modal>, 'children'> & {
    children?: ReactNode;
  }
) => (
  <Modal
    testId="unsaved-changes-modal"
    title="You have unsaved changes"
    appElement={document.getElementById('root') ?? document.body}
    getContainer={() => document.getElementById('root') ?? document.body}
    okText="Proceed"
    {...props}
  >
    <Body>Are you sure you want to leave? Your changes will not be saved.</Body>
  </Modal>
);
