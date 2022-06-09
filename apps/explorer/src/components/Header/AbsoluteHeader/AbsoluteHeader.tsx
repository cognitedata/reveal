import { HeaderLeft, StyledAbsoluteHeader } from '../elements';

export interface Props {
  Left?: () => JSX.Element | null;
}

export const AbsoluteHeader: React.FC<React.PropsWithChildren<Props>> = ({
  children,
  Left,
}) => {
  return (
    <StyledAbsoluteHeader>
      {Left && (
        <HeaderLeft>
          <Left />
        </HeaderLeft>
      )}
      {children}
    </StyledAbsoluteHeader>
  );
};
