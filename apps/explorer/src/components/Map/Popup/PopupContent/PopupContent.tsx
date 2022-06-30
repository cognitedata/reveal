import { Button, Flex, Label } from '@cognite/cogs.js';
import { ReactNode } from 'react';
import { Link } from 'react-router-dom';

import {
  FullWidthContainer,
  ButtonWithMargin,
  DivWithMarginBottom,
  FlexColumnSpaceAround,
  FlexSpaceBetween,
} from '../elements';

interface Props {
  labels: string[];
  disableRoute?: boolean;
  handleEdit?: () => void;
  Icon: ReactNode;
}

export const PopupContent: React.FC<Props> = ({
  labels,
  disableRoute = false,
  handleEdit,
  children,
  Icon,
}) => {
  return (
    <FlexColumnSpaceAround>
      <DivWithMarginBottom>
        <FlexSpaceBetween>
          {Icon}
          <div>
            {handleEdit && (
              <Button
                aria-label="Edit information"
                icon="Edit"
                onClick={handleEdit}
              />
            )}
            <Link to="/home">
              <ButtonWithMargin
                type="ghost"
                icon="Close"
                aria-label="close-popup"
              />
            </Link>
          </div>
        </FlexSpaceBetween>
        <FullWidthContainer>{children}</FullWidthContainer>
      </DivWithMarginBottom>
      <Flex gap={6}>
        {labels.map((label) => (
          <Label variant="unknown" key={label}>
            {label}
          </Label>
        ))}
      </Flex>
      <Flex justifyContent="flex-end">
        <Button type="primary" disabled={disableRoute}>
          Directions
        </Button>
      </Flex>
    </FlexColumnSpaceAround>
  );
};
