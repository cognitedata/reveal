import { sizes } from 'styles/layout';
import styled from 'styled-components';
import layers from 'utils/zindex';

interface Props {
  Left?: () => JSX.Element | null;
}

const StyledHeader = styled.div`
  z-index: ${layers.MAXIMUM};
  gap: ${sizes.small};
  padding: ${sizes.normal};
  justify-content: space-around;
  align-items: center;
  display: flex;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
`;

const HeaderLeft = styled.div`
  flex: 1;
`;

export const Header: React.FC<React.PropsWithChildren<Props>> = ({
  children,
  Left,
}) => {
  return (
    <StyledHeader>
      {Left && (
        <HeaderLeft>
          <Left />
        </HeaderLeft>
      )}
      {children}
    </StyledHeader>
  );
};
