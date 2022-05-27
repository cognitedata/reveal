import styled from 'styled-components';
import { sizes } from 'styles/layout';
import layers from 'utils/zindex';
import { Title } from '@cognite/cogs.js';

export interface Position {
  locationX: number;
  locationY: number;
}

interface Props {
  itemData: string;
}

const Container = styled.div`
  z-index: ${layers.MAXIMUM};
  position: absolute;
  width: 100%;
  bottom: ${sizes.medium};
  left: 0;
  display: flex;
  justify-content: center;
`;

const Content = styled.div`
  width: 85%;
  min-height: 200px;
  padding: ${sizes.small} ${sizes.medium};
  background: #ffffff;
  border-radius: ${sizes.medium};
`;

export const Popup: React.FC<Props> = ({ itemData }) => {
  return (
    <Container>
      <Content className="z-2">
        <Title level={3}>{itemData}</Title>
      </Content>
    </Container>
  );
};
