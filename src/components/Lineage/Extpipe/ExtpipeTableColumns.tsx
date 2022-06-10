import moment from 'moment';
import { Tooltip } from '@cognite/cogs.js';
import { toString as cronstureToString } from 'cronstrue';
import { Extpipe, SupportedSchedule } from 'utils/types';
import { ExtpipeLink } from 'components/Lineage/Extpipe/ExtpipeLink';
import { useTranslation } from 'common/i18n';

type LastStatuses = Pick<Extpipe, 'lastSuccess' | 'lastFailure'>;

export const calculate = ({
  lastFailure,
  lastSuccess,
}: LastStatuses): number => {
  if (
    (lastSuccess && lastSuccess > 0 && lastFailure === 0) ||
    (lastSuccess && moment(lastSuccess).isAfter(moment(lastFailure)))
  ) {
    return lastSuccess;
  }
  if (
    (lastFailure && lastFailure > 0 && lastSuccess === 0) ||
    (lastFailure &&
      lastSuccess &&
      moment(lastFailure).isAfter(moment(lastSuccess)))
  ) {
    return lastFailure;
  }
  if (
    lastFailure &&
    lastSuccess &&
    moment(lastFailure).isSame(moment(lastSuccess))
  ) {
    return lastFailure;
  }
  return 0;
};

export const parseCron = (cron: string): string => {
  return cronstureToString(cron);
};

const renderScheduled = (cronExpression: string): JSX.Element => {
  try {
    const humanReadableCron = parseCron(cronExpression);
    const displayString = `${SupportedSchedule.SCHEDULED}, ${humanReadableCron}`;
    return (
      <Tooltip content={displayString} placement="top-start" arrow={false}>
        <>{displayString}</>
      </Tooltip>
    );
  } catch (error) {
    const displayError = `Schedule: "${cronExpression}" - ${error}`;
    return <>{displayError}</>;
  }
};

export const isScheduleOfType = (
  schedule: string,
  scheduleTypes: SupportedSchedule[]
): boolean => {
  return scheduleTypes.some((type) => {
    return type.toLowerCase() === schedule.toLowerCase();
  });
};

export const useExtpipeTableColumns = () => {
  const { t } = useTranslation();

  const extpipeTableColumns = [
    {
      title: t('name'),
      key: 'name',
      render: (row: Extpipe) => {
        return <ExtpipeLink extpipe={row} />;
      },
    },
    {
      title: t('schedule'),
      key: 'schedule',
      render: ({ schedule }: Extpipe) => {
        if (!schedule) {
          return t('not-defined');
        }
        if (
          isScheduleOfType(schedule, [
            SupportedSchedule.CONTINUOUS,
            SupportedSchedule.ON_TRIGGER,
          ])
        ) {
          return <>{schedule}</>;
        }
        return renderScheduled(schedule);
      },
      ellipsis: true,
    },
    {
      title: t('last-run-time'),
      key: 'latestRun',
      render: ({ lastFailure, lastSuccess }: Extpipe) => {
        const lastRunTime = calculate({ lastFailure, lastSuccess });
        return lastRunTime > 0 ? moment(lastRunTime).fromNow() : '–';
      },
      ellipsis: true,
    },
    {
      title: t('source_one'),
      key: 'source',
      render: ({ source }: Extpipe) => {
        return source ?? '–';
      },
      ellipsis: true,
    },
    {
      title: t('owner'),
      key: 'owner',
      render: (extpipe: Extpipe) => {
        const owner = extpipe.contacts?.find(
          (contact) => !!contact.role && contact.role.toLowerCase() === 'owner'
        );
        if (owner) {
          const mailtoLink = `mailto:${owner.email}`;
          return (
            <a href={mailtoLink} target="_blank" rel="noopener noreferrer">
              {owner.name}
            </a>
          );
        }
        return '–';
      },
      ellipsis: true,
    },
  ];

  return { extpipeTableColumns };
};
