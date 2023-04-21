import { Button, Colors } from '@cognite/cogs.js';
import { StickyIcon } from './icons/StickyIcon';

type StickyButtonProps = {
  toggled: boolean;
  onClick: () => void;
  ariaLabel?: string;
  key?: string;
};

export const StickyButton: React.FC<StickyButtonProps> = ({
  toggled,
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
      toggled={toggled}
      onClick={onClick}
    >
      <i className="cogs-icon">
        <StickyIcon
          fill={
            isToggled
              ? Colors['text-icon--interactive--pressed']
              : Colors['text-icon--strong']
          }
        />
      </i>
    </Button>
  );
};
