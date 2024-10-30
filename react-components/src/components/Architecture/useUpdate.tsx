/*!
 * Copyright 2024 Cognite AS
 */

import { useEffect } from 'react';
import { type BaseCommand } from '../../architecture/base/commands/BaseCommand';

export const useUpdate = (command: BaseCommand, update: (command: BaseCommand) => void): void => {
  useEffect(() => {
    update(command);
    command.addEventListener(update);
    return () => {
      command.removeEventListener(update);
    };
  }, [command, update]);
};
