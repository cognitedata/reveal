import { useMemo, type ReactElement } from 'react';
import { type BaseCommand } from '../../architecture/base/commands/BaseCommand';
import { type PlacementType } from './types';
import { type ButtonProp } from './RevealButtons';
import { createDividerByKey } from './DividerCreator';
import { useComponentFactory } from '../RevealCanvas/ViewerContext';

export function createButtonFromCommandConstructor(
  commandConstructor: () => BaseCommand,
  prop: ButtonProp
): ReactElement {
  const command = useMemo(commandConstructor, []);
  const factory = useComponentFactory();
  return factory.createElement(command, prop.toolbarPlacement ?? 'left');
}

export const CommandButtons = ({
  commands,
  placement
}: {
  commands: Array<BaseCommand | undefined>;
  placement: PlacementType;
}): ReactElement => {
  const factory = useComponentFactory();
  return (
    <>
      {commands.map((command, index): ReactElement => {
        if (command === undefined) {
          return createDividerByKey(`undefined${index.toString()}`, placement);
        }
        return factory.createElement(command, placement);
      })}
    </>
  );
};
