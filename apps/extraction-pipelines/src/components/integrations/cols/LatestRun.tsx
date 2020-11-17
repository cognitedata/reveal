import React, { FunctionComponent } from 'react';
import moment from 'moment';
import { TimeDisplay } from '../../TimeDisplay/TimeDisplay';

interface OwnProps {
  latestRunTime: moment.Moment | null;
}

type Props = OwnProps;

const LatestRun: FunctionComponent<Props> = ({ latestRunTime }: Props) => {
  return (
    <>
      {latestRunTime && (
        <TimeDisplay value={latestRunTime.toDate()} relative withTooltip />
      )}
    </>
  );
};

export default LatestRun;
