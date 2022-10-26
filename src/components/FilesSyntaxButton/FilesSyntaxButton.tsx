import * as React from 'react';
import { Button, Dropdown } from '@cognite/cogs.js';
import { useDisclosure } from 'hooks';
import { InfoPanel } from 'components';
// import { InfoPanel } from '@cognite/react-document-search';

export const FilesSyntaxButton: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure({ isOpen: false });

  return (
    <Dropdown
      visible={isOpen}
      onClickOutside={onClose}
      content={<InfoPanel handleClose={onClose} />}
      placement="right-start"
    >
      <Button
        icon={'Code'}
        aria-label="Open document search info popup"
        onClick={onOpen}
      >
        Files syntax
      </Button>
    </Dropdown>
  );
};
