import { Modal } from '@cognite/cogs.js-v9';
import { ComponentProps, ReactNode } from 'react';

export const UnsavedChangesModal = (
  props: Omit<
    ComponentProps<typeof Modal>,
    'children' | 'additionalOptions' | 'size'
  > & {
    children?: ReactNode;
  }
) => (
  <Modal
    data-testid="unsaved-changes-modal"
    title="You have unsaved changes"
    getContainer={() => document.getElementById('root') ?? document.body}
    okText="Proceed"
    {...props}
  >
    Are you sure you want to leave? Your changes will not be saved.
  </Modal>
);
