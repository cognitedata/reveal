import { Button } from '@cognite/cogs.js';

import { CircleIcon, CircleIconProps } from '../icons/CircleIcon';

type CircleButtonProps = {
  isToggled: boolean;
  onClick: () => void;
  ariaLabel?: string;
  key?: string;
} & CircleIconProps;

export const CircleButton: React.FC<CircleButtonProps> = ({
  isToggled,
  onClick,
  ariaLabel,
  key,
  ...iconProps
}) => {
  // NOTE: Since we can't pass an SVG directly to the Cogs.js Button component or to the ToolBarButton component,
  //       we have to create our own SVG icon components and pass them to the Cogs.js Button component.
  //       Should Cogs.js instead allow us to pass an SVG directly to the Button component?
  return (
    <Button
      key={key}
      className="cogs-button--icon-only"
      aria-label={ariaLabel}
      type="ghost"
      toggled={isToggled}
      onClick={onClick}
    >
      <i className="cogs-icon">
        <CircleIcon {...iconProps} />
      </i>
    </Button>
  );
};
