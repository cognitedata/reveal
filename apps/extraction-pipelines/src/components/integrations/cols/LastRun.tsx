import React, { FunctionComponent } from 'react';
import moment from 'moment';
import { Badge } from 'antd';
import { TimeDisplay } from '../../TimeDisplay/TimeDisplay';
import { isDateDiffLessThanDays } from '../../../utils/dateUtils';

interface OwnProps {
  lastUpdatedTime: number;
  numberOfDays: number;
  unitOfTime: moment.unitOfTime.Diff;
}

type Props = OwnProps;

const LastRun: FunctionComponent<Props> = ({
  lastUpdatedTime,
  numberOfDays,
  unitOfTime,
}: Props) => {
  const status = (updatedTime: number) => {
    const statusOK = isDateDiffLessThanDays(
      updatedTime,
      numberOfDays,
      unitOfTime
    );
    if (statusOK) {
      return <Badge color="green" size="default" aria-label="Status ok" />;
    }
    return <Badge color="red" aria-label="Not ok" />;
  };
  return (
    <>
      {status(lastUpdatedTime)}
      <TimeDisplay value={lastUpdatedTime} relative withTooltip />
    </>
  );
};

export default LastRun;
