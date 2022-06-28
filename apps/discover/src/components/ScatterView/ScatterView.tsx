// eslint-disable-next-line @cognite/styled-macro
import styled from 'styled-components';

import { Tooltip } from 'components/PopperTooltip';

import { DetailCard, DetailCardMetadata } from '../DetailCard';

export type ScatterViewEvent = {
  id: string;
  dotColor?: string;
  metadata: DetailCardMetadata[];
};

interface Props {
  events: ScatterViewEvent[];
}

export const ScatterView: React.FC<Props> = ({ events }) => {
  return (
    <Content>
      {events.map((event) => (
        <Tooltip
          key={event.id}
          content={<DetailCard data={event.metadata} />}
          hideArrow
          followCursor
        >
          <Dot color={event.dotColor} />
        </Tooltip>
      ))}
    </Content>
  );
};

const Content = styled.div`
  height: 100%;
  width: 100%;
  padding: 8px 2px;
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  gap: 3px;
  align-content: flex-start;
  overflow-x: auto;
`;

const Dot = styled.div<{ color?: string }>`
  background-color: ${(props) => props.color || '#000'};
  width: 8px;
  height: 8px;
  border-radius: 2px;
`;
