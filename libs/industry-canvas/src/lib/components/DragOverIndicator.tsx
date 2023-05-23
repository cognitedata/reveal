import { Icon, Title } from '@cognite/cogs.js';
import styled from 'styled-components';

type DragOverIndicatorProps = {
  isDragging: boolean;
};

const DragOverIndicator = ({
  isDragging,
}: DragOverIndicatorProps): JSX.Element => {
  if (!isDragging) {
    return <></>;
  }

  return (
    <AbsoluteWrapper>
      <CenteredAbsoluteWrapper>
        <RowFlex>
          <Title
            style={{
              fontSize: '36px',
            }}
            level={2}
          >
            Drop
          </Title>
          <Icon type="Upload" size={80} />
        </RowFlex>
      </CenteredAbsoluteWrapper>
    </AbsoluteWrapper>
  );
};

const AbsoluteWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;

  background: rgba(0, 0, 0, 0.25);

  /* Don't listen to any events */
  pointer-events: none;
`;

const CenteredAbsoluteWrapper = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;

const RowFlex = styled.div`
  display: flex;
  flex-direction: row;
  gap: 16px;
`;

export default DragOverIndicator;
