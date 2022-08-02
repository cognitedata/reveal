import { HeaderLeft, StyledAbsoluteHeader } from '../elements';

export interface CompoundComponent {
  Left: React.FC<React.PropsWithChildren<unknown>>;
}

export const AbsoluteHeader: React.FC<React.PropsWithChildren<unknown>> &
  CompoundComponent = ({ children }) => {
  return <StyledAbsoluteHeader>{children}</StyledAbsoluteHeader>;
};
AbsoluteHeader.Left = HeaderLeft;
