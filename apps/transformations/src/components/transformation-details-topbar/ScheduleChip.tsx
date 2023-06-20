import { useTranslation } from '@transformations/common';
import { TransformationRead } from '@transformations/types';

import { Chip } from '@cognite/cogs.js';

type ScheduleChipProps = {
  blocked: TransformationRead['blocked'];
  schedule: TransformationRead['schedule'];
};

const ScheduleChip = ({
  blocked,
  schedule,
}: ScheduleChipProps): JSX.Element => {
  const { t } = useTranslation();

  if (blocked) {
    return (
      <Chip
        selectable
        size="x-small"
        type="danger"
        label={t('schedule-blocked')}
      />
    );
  }

  if (!schedule) {
    return (
      <Chip
        selectable
        size="x-small"
        type="default"
        label={t('schedule-not-scheduled')}
      />
    );
  }

  if (schedule.isPaused) {
    return (
      <Chip
        selectable
        size="x-small"
        type="default"
        label={t('schedule-paused')}
      />
    );
  }

  return (
    <Chip
      selectable
      size="x-small"
      type="neutral"
      label={t('schedule-scheduled')}
    />
  );
};

export default ScheduleChip;
