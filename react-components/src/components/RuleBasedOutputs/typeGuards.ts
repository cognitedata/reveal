/*!
 * Copyright 2024 Cognite AS
 */

import { FdmRuleTrigger, MetadataRuleTrigger, TimeseriesRuleTrigger } from "./types";

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
