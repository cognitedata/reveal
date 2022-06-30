import { Button, Flex, Label } from '@cognite/cogs.js';
import { Link } from 'react-router-dom';

import {
  ButtonWithMargin,
  DivWithMarginBottom,
  FlexColumnSpaceAround,
  FlexEnd,
} from '../elements';

interface Props {
  labels: string[];
  handleSubmit: () => void;
}

// Note: Add ability to modify labels
export const EditPopupContent: React.FC<Props> = ({
  labels,
  handleSubmit,
  children,
}) => {
  return (
    <FlexColumnSpaceAround>
      <DivWithMarginBottom>{children}</DivWithMarginBottom>
      <Flex gap={6}>
        {labels.map((label) => (
          <Label
            variant="unknown"
            key={label}
            icon="Close"
            iconPlacement="right"
          >
            {label}
          </Label>
        ))}
        <Label variant="unknown" icon="Add" />
      </Flex>
      <FlexEnd>
        <Button onClick={handleSubmit} type="primary">
          Done
        </Button>
        <Link to="/home">
          <ButtonWithMargin>Close</ButtonWithMargin>
        </Link>
      </FlexEnd>
    </FlexColumnSpaceAround>
  );
};
