import React, { FunctionComponent } from 'react';

interface OwnProps {
  schedule?: string;
}

type Props = OwnProps;

const Schedule: FunctionComponent<Props> = ({ schedule }: Props) => {
  switch (schedule) {
    case undefined:
      return <>Not defined</>;
    case 'On Trigger':
      return <>{schedule}</>;
    default:
      return <>{schedule}</>;
  }
};

Schedule.defaultProps = {
  schedule: undefined,
};

export default Schedule;
