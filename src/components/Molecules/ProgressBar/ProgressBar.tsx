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

const Value = styled.div.attrs((props: ValueProps) => props)`
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
      <div>
        {label}: {value}
      </div>
    ))}

    <div>total: {props.total}</div>
  </>
);

const ProgressBar = (props: { progress?: ProgressType[]; total?: number }) => {
  const progress = props.progress || emptyProgress;
  const total = props.total || 0;

  return (
    <Tooltip
      placement="bottom"
      content={<ToolTipContent progress={progress} total={total} />}
    >
      <Bar>
        {progress.map(({ value, color }: ProgressType) => (
          <Value
            color={color}
            percentage={total ? Math.round((value / total) * 100) : 100}
          >
            <br />
          </Value>
        ))}
      </Bar>
    </Tooltip>
  );
};

export default ProgressBar;
