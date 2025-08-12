import { useMemo, type ReactElement } from 'react';
import { type BaseCommand } from '../../architecture/base/commands/BaseCommand';
import { type PlacementType } from './types';
import { type ButtonProp } from './RevealButtons';
import { createReactElement } from './Factories/ReactElementFactory';
import { createDividerByKey } from './DividerCreator';

export function createButtonFromCommandConstructor(
  commandConstructor: () => BaseCommand,
  prop: ButtonProp
): ReactElement {
  const command = useMemo(commandConstructor, []);
  return createReactElement(command, prop.toolbarPlacement ?? 'left');
}

export const CommandButtons = ({
  commands,
  placement
}: {
  commands: Array<BaseCommand | undefined>;
  placement: PlacementType;
}): ReactElement => {
  return (
    <>
      {commands.map((command, index): ReactElement => {
        if (command === undefined) {
          return createDividerByKey(`undefined${index.toString()}`, placement);
        }
        return createReactElement(command, placement);
      })}
    </>
  );
};
