import { toString as cronstureToString } from 'cronstrue';
import moment from 'moment';

import { Tooltip } from '@cognite/cogs.js';

import { useTranslation } from '../../../common/i18n';
import {
  CogsTableCellRenderer,
  Extpipe,
  SupportedSchedule,
} from '../../../utils';

import { ExtpipeLink } from './ExtpipeLink';

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
      Header: t('name'),
      id: 'name',
      Cell: ({ row: { original: record } }: CogsTableCellRenderer<Extpipe>) => (
        <ExtpipeLink extpipe={record} />
      ),
    },
    {
      Header: t('schedule'),
      id: 'schedule',
      Cell: ({ row: { original: record } }: CogsTableCellRenderer<Extpipe>) => {
        const { schedule } = record;
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
      Header: t('last-run-time'),
      id: 'latestRun',
      Cell: ({ row: { original: record } }: CogsTableCellRenderer<Extpipe>) => {
        const { lastFailure, lastSuccess } = record;
        const lastRunTime = calculate({ lastFailure, lastSuccess });
        return lastRunTime > 0 ? moment(lastRunTime).fromNow() : '–';
      },
      ellipsis: true,
    },
    {
      Header: t('source_one'),
      id: 'source',
      Cell: ({ row: { original: record } }: CogsTableCellRenderer<Extpipe>) => {
        return record.source ?? '–';
      },
      ellipsis: true,
    },
    {
      Header: t('owner'),
      id: 'owner',
      Cell: ({
        row: { original: extpipe },
      }: CogsTableCellRenderer<Extpipe>) => {
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
