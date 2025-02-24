/*!
 * Copyright 2024 Cognite AS
 */

import { type FdmRuleTrigger, type MetadataRuleTrigger, type TimeseriesRuleTrigger } from './types';

export const isMetadataTrigger = (
  trigger: MetadataRuleTrigger | TimeseriesRuleTrigger | FdmRuleTrigger
): trigger is MetadataRuleTrigger => {
  return trigger.type === 'metadata';
};

export const isFdmTrigger = (
  trigger: MetadataRuleTrigger | TimeseriesRuleTrigger | FdmRuleTrigger
): trigger is FdmRuleTrigger => {
  return trigger.type === 'fdm';
};
