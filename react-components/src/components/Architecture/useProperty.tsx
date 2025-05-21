/*!
 * Copyright 2024 Cognite AS
 */

import { useState, useEffect, useCallback } from 'react';
import { type BaseCommand } from '../../architecture/base/commands/BaseCommand';

export function useProperty<T>(command: BaseCommand | undefined, getValue: () => T): T {
  const [value, setValue] = useState<T>(getValue);

  const memoizedUpdate = useCallback(() => {
    setValue(getValue());
  }, [command]);

  useEffect(() => {
    if (command === undefined) {
      return;
    }
    memoizedUpdate();
    command.addEventListener(memoizedUpdate);
    return () => {
      command.removeEventListener(memoizedUpdate);
    };
  }, [command, memoizedUpdate]);
  return value;
}
