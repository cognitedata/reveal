import { HeaderLeft, StyledRegularHeader } from '../elements';

export interface CompoundComponent {
  Left: React.FC<React.PropsWithChildren<unknown>>;
}

export const RegularHeader: React.FC<React.PropsWithChildren<unknown>> &
  CompoundComponent = ({ children }) => {
  return <StyledRegularHeader>{children}</StyledRegularHeader>;
};

RegularHeader.Left = HeaderLeft;
