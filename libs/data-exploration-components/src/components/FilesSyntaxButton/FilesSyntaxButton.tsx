import * as React from 'react';

import { InfoPanel } from '@data-exploration-components/components';
import { useDisclosure } from '@data-exploration-components/hooks';

import { Button, Dropdown } from '@cognite/cogs.js';

import {
  DATA_EXPLORATION_COMPONENT,
  useMetrics,
} from '@data-exploration-lib/core';

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
        icon="Code"
        aria-label="Open document search info popup"
        onClick={() => {
          onOpen();
          trackUsage(DATA_EXPLORATION_COMPONENT.OPEN.FILE_SYNTAX);
        }}
      >
        Files syntax
      </Button>
    </Dropdown>
  );
};
