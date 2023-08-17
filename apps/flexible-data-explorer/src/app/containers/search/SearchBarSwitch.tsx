import styled, { css } from 'styled-components';

import { Button } from '@cognite/cogs.js';

import { useViewModeParams } from '../../hooks/useParams';

interface Props {
  inverted?: boolean;
}

export const SearchBarSwitch: React.FC<Props> = ({ inverted }) => {
  const [viewMode, setViewMode] = useViewModeParams();

  const handle3DViewClick = () => {
    setViewMode('3d');
  };
  const handleListViewClick = () => {
    setViewMode('list');
  };

  return (
    <Container inverted={inverted}>
      <StyledButton
        type={viewMode === 'list' ? 'secondary' : 'ghost'}
        icon="List"
        onClick={handleListViewClick}
      />
      <StyledButton
        type={viewMode === '3d' ? 'secondary' : 'ghost'}
        icon="Cube"
        onClick={handle3DViewClick}
      />
    </Container>
  );
};

const StyledButton = styled(Button)`
  &&& {
    border-radius: 10px;
  }
`;

const Container = styled.div<{
  width?: string;
  inverted?: boolean;
}>`
  width: 92px;
  height: 52px;
  background-color: #ffffff;
  border-radius: 10px;
  padding: 8px;
  gap: 4px;
  display: flex;

  ${(props) => {
    if (props.inverted) {
      return css`
        background-color: #f3f4f8;
        outline: 1px solid rgba(210, 212, 218, 0.56);
      `;
    }

    return css`
      filter: drop-shadow(0px 1px 8px rgba(79, 82, 104, 0.06))
        drop-shadow(0px 1px 1px rgba(79, 82, 104, 0.1));
    `;
  }};
`;
