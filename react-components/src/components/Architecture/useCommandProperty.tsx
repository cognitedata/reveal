import { useState, useEffect, useCallback } from 'react';
import { type BaseCommand } from '../../architecture/base/commands/BaseCommand';

export function useCommandProperty<T>(command: BaseCommand, getValue: () => T): T {
  const [value, setValue] = useState<T>(getValue);

  const memoizedUpdate = useCallback(() => {
    setValue(getValue());
  }, [command]);

  useEffect(() => {
    memoizedUpdate();
    command.addEventListener(memoizedUpdate);
    return () => {
      command.removeEventListener(memoizedUpdate);
    };
  }, [command, memoizedUpdate]);
  return value;
}
