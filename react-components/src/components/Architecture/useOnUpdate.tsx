/*!
 * Copyright 2024 Cognite AS
 */

import { useCallback, useEffect, useState } from 'react';
import { type BaseCommand } from '../../architecture/base/commands/BaseCommand';
import { DomainObject } from '../../architecture';

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

export const useOnUpdateDomainObject = (object: DomainObject, update: () => void): void => {
  const memoizedUpdate = useCallback(update, [object]);

  useEffect(() => {
    memoizedUpdate();
    object.views.addEventListener(memoizedUpdate);
    return () => object.views.removeEventListener(memoizedUpdate);
  }, [object, memoizedUpdate]);
};
