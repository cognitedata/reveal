import { Button, Colors, Tooltip } from '@cognite/cogs.js';

import { translationKeys } from '../../common';
import { useTranslation } from '../../hooks/useTranslation';
import { LineThicknessIcon } from '../icons/LineThicknessIcon';

type LineThicknessButtonProps = {
  isToggled?: boolean;
  onClick?: () => void;
};

export const LineThicknessButton: React.FC<LineThicknessButtonProps> = ({
  isToggled: toggled,
  onClick,
}) => {
  const { t } = useTranslation();
  return (
    <Tooltip
      content={t(
        translationKeys.ANNOTATION_CHANGE_LINE_STROKE_WIDTH,
        'Change stroke width'
      )}
    >
      <Button
        type="ghost"
        className="cogs-button--icon-only"
        toggled={toggled}
        onClick={onClick}
        aria-label={t(
          translationKeys.ANNOTATION_CHANGE_LINE_STROKE_WIDTH,
          'Change stroke width'
        )}
      >
        <i className="cogs-icon">
          <LineThicknessIcon
            fill={toggled ? Colors['text-icon--interactive--pressed'] : 'black'}
          />
        </i>
      </Button>
    </Tooltip>
  );
};
