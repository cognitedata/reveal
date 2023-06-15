import styled from 'styled-components';

import {
  PageDirection,
  useTransformationContext,
} from '@transformations/pages/transformation-details/TransformationContext';

import { Colors, Elevations, Overline } from '@cognite/cogs.js';

type MinimizedLayoutSectionProps = {
  isLeftAligned?: boolean;
  onClick: () => void;
  title: string;
};

const MinimizedLayoutSection = ({
  isLeftAligned,
  onClick,
  title,
}: MinimizedLayoutSectionProps): JSX.Element => {
  const { pageDirection } = useTransformationContext();

  return (
    <SectionContainer
      $isLeftAligned={isLeftAligned}
      $direction={pageDirection}
      onClick={onClick}
    >
      <Box>
        <Content $direction={pageDirection}>
          <SectionTitle level={3}>{title}</SectionTitle>
        </Content>
      </Box>
    </SectionContainer>
  );
};

const SectionContainer = styled.div<{
  $direction?: PageDirection;
  $isLeftAligned?: boolean;
}>`
  height: 100%;
  padding: ${({ $direction, $isLeftAligned }) => {
    if ($direction === 'horizontal') {
      return $isLeftAligned ? '12px 6px 12px 12px' : '12px 12px 12px 6px';
    }
    return $isLeftAligned ? '12px 12px 6px' : '6px 12px 12px';
  }};
`;

const Box = styled.div`
  background-color: ${Colors['surface--muted']};
  border: 1px solid transparent;
  border-radius: 6px;
  box-shadow: ${Elevations['elevation--surface--non-interactive']};
  cursor: pointer;
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;

  :hover {
    background-color: ${Colors['surface--medium']};
    box-shadow: ${Elevations['elevation--surface--interactive']};
  }
`;

const Content = styled.div<{
  $direction: PageDirection;
}>`
  align-items: center;
  display: flex;
  gap: 8px;
  padding: ${({ $direction }) =>
    $direction === 'horizontal' ? '0 12px' : '8px 12px'};
  ${({ $direction }) =>
    $direction === 'horizontal'
      ? 'transform: translate(0, calc(50%)) rotate(90deg)'
      : ''};
`;

const SectionTitle = styled(Overline)`
  white-space: nowrap;
`;

export default MinimizedLayoutSection;
