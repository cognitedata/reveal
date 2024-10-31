/*!
 * Copyright 2024 Cognite AS
 */

import { useCallback, useEffect } from 'react';
import { type BaseCommand } from '../../architecture/base/commands/BaseCommand';

export const useOnUpdate = (command: BaseCommand, update: () => void): void => {
  const memoizedUpdate = useCallback(update, [command]);
  useEffect(() => {
    memoizedUpdate();
    command.addEventListener(memoizedUpdate);
    return () => {
      command.removeEventListener(memoizedUpdate);
    };
  }, [command, memoizedUpdate]);
};
