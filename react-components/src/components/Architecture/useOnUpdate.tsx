import { useCallback, useEffect } from 'react';
import { type BaseCommand } from '../../architecture/base/commands/BaseCommand';
import { type DomainObject } from '../../architecture';

export const useOnUpdate = (command: BaseCommand | undefined, update: () => void): void => {
  const memoizedUpdate = useCallback(update, [command]);
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
};

export const useOnUpdateDomainObject = (
  object: DomainObject | undefined,
  update: () => void
): void => {
  const memoizedUpdate = useCallback(update, [object]);

  useEffect(() => {
    if (object === undefined) {
      return;
    }

    memoizedUpdate();
    object.views.addEventListener(memoizedUpdate);
    return () => {
      object.views.removeEventListener(memoizedUpdate);
    };
  }, [object, memoizedUpdate]);
};
