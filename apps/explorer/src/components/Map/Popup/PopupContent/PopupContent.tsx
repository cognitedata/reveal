import { Button, Flex, Label } from '@cognite/cogs.js';
import { Link } from 'react-router-dom';

import {
  FullWidthContainer,
  ButtonWithMargin,
  DivWithMarginBottom,
  FlexColumnSpaceAround,
  FlexSpaceBetween,
} from '../elements';

import { NavigationButton } from './NavigationButton';

interface Props {
  labels: string[];
  handleEdit?: () => void;
  nodeId?: any;
  Icon: () => JSX.Element | null;
}

export const PopupContent: React.FC<Props> = ({
  labels,
  nodeId,
  handleEdit,
  Icon,
  children,
}) => {
  return (
    <FlexColumnSpaceAround>
      <DivWithMarginBottom>
        <FlexSpaceBetween>
          <Icon />
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
        <NavigationButton nodeId={nodeId} />
      </Flex>
    </FlexColumnSpaceAround>
  );
};
