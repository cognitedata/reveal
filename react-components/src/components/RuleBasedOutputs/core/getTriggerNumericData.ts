import {
  type TriggerTypeData,
  type MetadataRuleTrigger,
  type TimeseriesRuleTrigger,
  type FdmRuleTrigger
} from '../types';
import { getTriggerTimeseriesNumericData } from './getTriggerTimeseriesNumericData';

export const getTriggerNumericData = (
  triggerTypeData: TriggerTypeData[],
  trigger: MetadataRuleTrigger | TimeseriesRuleTrigger | FdmRuleTrigger
): number | undefined => {
  const currentTriggerData = triggerTypeData.find(
    (triggerType) => triggerType.type === trigger?.type
  );

  if (currentTriggerData === undefined) return;

  if (currentTriggerData.type === 'metadata' && trigger.type === 'metadata') {
    return Number(currentTriggerData.asset[trigger.type]?.[trigger.key]);
  } else if (currentTriggerData.type === 'timeseries' && trigger.type === 'timeseries') {
    return getTriggerTimeseriesNumericData(currentTriggerData, trigger);
  }
};
