import * as React from 'react';
import { Button, Dropdown } from '@cognite/cogs.js';
import { useDisclosure } from 'hooks';
import { InfoPanel } from 'components';
import { useMetrics } from 'hooks/useMetrics';

export const FilesSyntaxButton: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure({ isOpen: false });
  const trackUsage = useMetrics();

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
        onClick={() => {
          onOpen();
          trackUsage('Exploration.Open.FileSyntax');
        }}
      >
        Files syntax
      </Button>
    </Dropdown>
  );
};
