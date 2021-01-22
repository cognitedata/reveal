import { Colors, Tooltip } from '@cognite/cogs.js';
import styled from 'styled-components';
import { ProgressType, ValueProps } from '.';

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

const emptyProgress = [
  {
    label: 'Succeeded',
    value: 0,
    color: Colors['midblue-3'].hex(),
  },
];

const ToolTipContent = (props: { progress: ProgressType[]; total: number }) => (
  <>
    {props.progress.map(({ label, value }: ProgressType) => (
      <div key={label}>
        {label}: {value}
      </div>
    ))}
    <div>total: {props.total}</div>
  </>
);

const ProgressBar = (props: { progress?: ProgressType[]; total?: number }) => {
  const progress = props.progress || emptyProgress;
  const total = props.total || 0;
  const totalProgress: number = progress.reduce((a, b) => ({
    ...a,
    value: a.value + b.value,
  })).value;

  return (
    <Tooltip
      placement="bottom"
      content={<ToolTipContent progress={progress} total={total} />}
    >
      <>
        <P>
          {totalProgress} / {total}
        </P>
        <Bar>
          {progress.map(({ value, label, color }: ProgressType) => (
            <Value
              key={label}
              color={color}
              percentage={total ? Math.round((value / total) * 100) : 0}
            >
              <br />
            </Value>
          ))}
        </Bar>
      </>
    </Tooltip>
  );
};

export default ProgressBar;
