import React from 'react';
import moment from 'moment';
import { Tooltip } from '@cognite/cogs.js';
import { toString as cronstureToString } from 'cronstrue';
import { LabelTagGrey } from 'utils/styledComponents';
import { Extpipe, SupportedSchedule } from 'utils/types';
import { ExtpipeLink } from 'components/Lineage/Extpipe/ExtpipeLink';

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

export const ExtpipeTableColumns = [
  {
    title: 'Name',
    key: 'name',
    render: (row: Extpipe) => {
      return <ExtpipeLink extpipe={row} />;
    },
  },
  {
    title: 'Schedule',
    key: 'schedule',
    render: ({ schedule }: Extpipe) => {
      if (!schedule) {
        return <LabelTagGrey>Not defined</LabelTagGrey>;
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
    title: 'Last run',
    key: 'latestRun',
    render: ({ lastFailure, lastSuccess }: Extpipe) => {
      const latestRun = calculate({ lastFailure, lastSuccess });
      return (
        <>
          {latestRun > 0 ? (
            moment(latestRun).fromNow()
          ) : (
            <LabelTagGrey>Not activated</LabelTagGrey>
          )}
        </>
      );
    },
    ellipsis: true,
  },
  {
    title: 'Source',
    key: 'source',
    render: ({ source }: Extpipe) => {
      return <>{source ?? <LabelTagGrey>Not defined</LabelTagGrey>}</>;
    },
    ellipsis: true,
  },
  {
    title: 'Owner',
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
      return <LabelTagGrey>Not defined</LabelTagGrey>;
    },
    ellipsis: true,
  },
];
