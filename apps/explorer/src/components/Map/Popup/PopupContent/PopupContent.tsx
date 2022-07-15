import { Button, Flex, Label } from '@cognite/cogs.js';
import { Link } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';
import { isEditModeAtom } from 'recoil/popupShared/isEditModeAtom';

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
  isEditable?: boolean;
  nodeId?: any;
  Icon: () => JSX.Element | null;
}

export const PopupContent: React.FC<Props> = ({
  labels,
  nodeId,
  isEditable = true,
  Icon,
  children,
}) => {
  const setIsEditMode = useSetRecoilState(isEditModeAtom);
  const handleEditButtonClick = () => setIsEditMode(true);

  return (
    <FlexColumnSpaceAround>
      <DivWithMarginBottom>
        <FlexSpaceBetween>
          <Icon />
          <div>
            {isEditable && (
              <Button
                aria-label="Edit information"
                icon="Edit"
                onClick={handleEditButtonClick}
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
