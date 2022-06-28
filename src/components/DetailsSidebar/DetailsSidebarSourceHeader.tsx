import { Title } from '@cognite/cogs.js';
import {
  SourceSquare,
  SourceCircle,
  SourceItemName,
  SourceItemWrapper,
} from '../Common/SidebarElements';

type Props = {
  isTimeSeries: boolean;
  title: string;
  color: string;
  name: string;
};

const DetailsSidebarSourceHeader = ({
  isTimeSeries,
  title,
  color,
  name,
}: Props) => {
  return (
    <div style={{ wordBreak: 'break-word' }}>
      <Title level={6}>{title}</Title>
      <SourceItemWrapper>
        {isTimeSeries ? (
          <SourceCircle color={color} fade={false} />
        ) : (
          <SourceSquare color={color} fade={false} />
        )}
        <SourceItemName>{name}</SourceItemName>
      </SourceItemWrapper>
    </div>
  );
};

export default DetailsSidebarSourceHeader;
