import { Button } from '@cognite/cogs.js';
import { FillIcon } from '../icons/FillIcon';
import { TransparentIcon } from '../icons/TransparentIcon';

type FillButtonProps = {
  color: string;
  isToggled: boolean;
  onClick: (color: string) => void;
  ariaLabel?: string;
  key?: string;
};

export const FillButton: React.FC<FillButtonProps> = ({
  color,
  isToggled,
  onClick,
  ariaLabel,
  key,
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
      onClick={() => onClick(color)}
    >
      <i className="cogs-icon">
        {color === 'transparent' ? (
          <TransparentIcon />
        ) : (
          <FillIcon color={color} />
        )}
      </i>
    </Button>
  );
};
