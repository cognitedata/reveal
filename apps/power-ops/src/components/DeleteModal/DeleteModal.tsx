import { Modal } from '@cognite/cogs.js-v9';
import { ComponentProps } from 'react';

export const DeleteModal = ({
  title,
  ...rest
}: Omit<
  ComponentProps<typeof Modal>,
  'children' | 'additionalActions' | 'size'
>) => (
  <Modal
    data-testid="delete-modal"
    title={['Delete', title].filter(Boolean).join(' ')}
    getContainer={() =>
      document.getElementById('root') ?? document.documentElement
    }
    {...rest}
  >
    Do you really want to delete{title && ` this ${title}`}?
  </Modal>
);
