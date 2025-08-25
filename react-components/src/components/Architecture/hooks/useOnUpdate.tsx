import { useEffect } from 'react';
import { type BaseCommand } from '../../../architecture/base/commands/BaseCommand';
import { type DomainObject } from '../../../architecture';

export const useOnUpdate = (command: BaseCommand | undefined, update: () => void): void => {
  useEffect(() => {
    if (command === undefined) {
      return;
    }

    update();

    command.addEventListener(update);
    return () => {
      command.removeEventListener(update);
    };
  }, [command, update]);
};

export const useOnUpdateDomainObject = (
  object: DomainObject | undefined,
  update: () => void
): void => {
  useEffect(() => {
    if (object === undefined) {
      return;
    }

    update();
    object.views.addEventListener(update);
    return () => {
      object.views.removeEventListener(update);
    };
  }, [object, update]);
};
