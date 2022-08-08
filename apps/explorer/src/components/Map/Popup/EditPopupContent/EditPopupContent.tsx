import { PAGES } from 'pages/constants';
import { Link } from 'react-router-dom';

import {
  ButtonWithMargin,
  DivWithMarginBottom,
  FlexColumnSpaceAround,
  FlexEnd,
} from '../elements';

interface Props {
  SubmitButton: React.ComponentType;
}

export const EditPopupContent: React.FC<React.PropsWithChildren<Props>> = ({
  SubmitButton,
  children,
}) => {
  return (
    <FlexColumnSpaceAround>
      <DivWithMarginBottom>{children}</DivWithMarginBottom>
      <FlexEnd>
        <SubmitButton />
        <Link to={PAGES.HOME}>
          <ButtonWithMargin>Close</ButtonWithMargin>
        </Link>
      </FlexEnd>
    </FlexColumnSpaceAround>
  );
};
