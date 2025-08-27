import { type FdmPropertyType } from '../../Reveal3DResources/types';
import { type FdmRuleTrigger } from '../types';

export function getFdmPropertyTrigger<T>(
  fdmPropertyTrigger: FdmPropertyType<unknown> | undefined,
  trigger: FdmRuleTrigger
): T | undefined {
  if (fdmPropertyTrigger === undefined) return;

  const space = fdmPropertyTrigger[trigger.key.space];
  const instanceProperties = space?.[
    `${trigger.key.view.externalId}/${trigger.key.view.version}`
  ] as FdmPropertyType<unknown>;
  const property = instanceProperties?.[trigger.key.property] as T;

  return property;
}
