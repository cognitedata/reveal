import { Colors, Tooltip } from '@cognite/cogs.js';
import { FC } from 'react';
import styled from 'styled-components';

import { ValueProps, ProgressType, ProgressBarProps } from '.';

const Bar = styled.div`
  width: 100%;
  height: 6px;
  background-color: var(--cogs-greyscale-grey4);
  border-radius: 5px;
  display: flex;
  flex-direction: row;
  overflow: hidden;
  max-width: 100%;
  max-height: 6px;
`;

const P = styled.p`
  margin-bottom: 0;
`;

const Value = styled.div<ValueProps>`
  height: 100%;
  background-color: ${(props) => props.color};
  width: ${(props) => props.percentage}%;
`;

const TooltipValue = styled.div`
  text-transform: capitalize;
  line-height: 160%;
`;

const emptyProgress = [
  {
    label: 'Succeeded',
    value: 0,
    color: Colors['midblue-3'].hex(),
  },
];

const ProgressBar: FC<Partial<ProgressBarProps>> = ({ name, ...props }) => {
  const progress = props.progress || emptyProgress;
  const total = props.total || 0;
  const totalProgress = props.totalProgress || 0;

  const ToolTipContent = () => (
    <>
      {progress.map(({ label, value }: ProgressType) => (
        <TooltipValue key={`${label}_tooltip`}>
          {label}: {value}
        </TooltipValue>
      ))}
      <TooltipValue>
        <strong>total: {props.total}</strong>
      </TooltipValue>
    </>
  );

  const progressBarTitle = [
    name,
    name && ':',
    ' ',
    totalProgress,
    '/',
    total,
  ].join('');

  return (
    <Tooltip placement="left" content={<ToolTipContent />}>
      <>
        <P>{progressBarTitle}</P>
        <Bar>
          {progress.map(({ value, label, color }: ProgressType) => (
            <Value
              key={label}
              color={color}
              percentage={total ? Math.round((value / total) * 100) : 0}
            />
          ))}
        </Bar>
      </>
    </Tooltip>
  );
};

export default ProgressBar;
