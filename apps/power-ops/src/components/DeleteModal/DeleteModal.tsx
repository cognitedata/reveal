import { Body, Modal } from '@cognite/cogs.js';
import { ComponentProps } from 'react';

export const DeleteModal = ({
  title,
  ...rest
}: Omit<
  ComponentProps<typeof Modal>,
  'children' | 'appElement' | 'testId'
>) => (
  <Modal
    testId="delete-modal"
    title={['Delete', title].filter(Boolean).join(' ')}
    appElement={document.getElementById('root') ?? document.documentElement}
    getContainer={() =>
      document.getElementById('root') ?? document.documentElement
    }
    {...rest}
  >
    <Body>Do you really want to delete{title && ` this ${title}`}?</Body>
  </Modal>
);
