// eslint-disable-next-line @cognite/styled-macro
import styled from 'styled-components';

import { Tooltip } from 'components/PopperTooltip';

import { DetailCard, DetailCardMetadata } from '../DetailCard';

export type ScatterViewEvent<T> = {
  id: string;
  dotColor?: string;
  original: T;
  metadata: DetailCardMetadata[];
};

interface Props<T> {
  events: ScatterViewEvent<T>[];
  renderTooltipContent?: (event: ScatterViewEvent<T>) => JSX.Element;
}

export const ScatterView = <T extends object>({
  events,
  renderTooltipContent,
}: Props<T>) => {
  return (
    <Content>
      {events.map((event) => (
        <Tooltip
          key={event.id}
          interactive
          content={
            renderTooltipContent?.(event) || (
              <DetailCard data={event.metadata} />
            )
          }
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
