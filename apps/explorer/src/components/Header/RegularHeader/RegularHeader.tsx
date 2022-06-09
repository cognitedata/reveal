import { HeaderLeft, StyledRegularHeader } from '../elements';

export interface Props {
  Left?: () => JSX.Element | null;
}

export const RegularHeader: React.FC<React.PropsWithChildren<Props>> = ({
  children,
  Left,
}) => {
  return (
    <StyledRegularHeader>
      {Left && (
        <HeaderLeft>
          <Left />
        </HeaderLeft>
      )}
      {children}
    </StyledRegularHeader>
  );
};
