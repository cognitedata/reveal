import { toString as cronstureToString } from 'cronstrue';
import { SupportedScheduleStrings } from 'components/integrations/cols/Schedule';
import { ScheduleFormInput } from 'components/integration/edit/Schedule';

export const parseCron = (cron: string) => {
  return cronstureToString(cron);
};
export const mapScheduleInputToScheduleValue = (field: ScheduleFormInput) => {
  switch (field.schedule) {
    case SupportedScheduleStrings.ON_TRIGGER:
    case SupportedScheduleStrings.CONTINUOUS: {
      return field.schedule;
    }
    case SupportedScheduleStrings.SCHEDULED: {
      return field.cron;
    }
    case SupportedScheduleStrings.NOT_DEFINED: {
      return '';
    }
    default:
      return undefined;
  }
};

export const mapModelToInput = (schedule?: string): ScheduleFormInput => {
  if (!schedule) {
    return {
      schedule: '',
      cron: '',
    };
  }
  if (
    schedule === SupportedScheduleStrings.ON_TRIGGER ||
    schedule === SupportedScheduleStrings.CONTINUOUS
  ) {
    return {
      schedule,
      cron: '',
    };
  }
  try {
    parseCron(schedule);
    return {
      schedule: SupportedScheduleStrings.SCHEDULED,
      cron: schedule,
    };
  } catch (_) {
    return {
      schedule: SupportedScheduleStrings.NOT_DEFINED,
      cron: '',
    };
  }
};
