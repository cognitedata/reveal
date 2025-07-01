import { useMemo } from 'react';
import { type BaseCommand } from '../../../architecture/base/commands/BaseCommand';
import { getDefaultCommand } from '../utilities';
import { useRenderTarget } from '../../RevealCanvas/ViewerContext';

export function useCommand<T extends BaseCommand>(inputCommand: T): T {
  const renderTarget = useRenderTarget();
  return useMemo<T>(() => getDefaultCommand(inputCommand, renderTarget), [inputCommand]);
}
