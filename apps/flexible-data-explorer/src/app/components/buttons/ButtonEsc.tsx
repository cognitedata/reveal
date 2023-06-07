import { Button, Shortcut } from '@cognite/cogs.js';

import { useEscapeButtonListener } from '../../hooks/listeners/useEscapeButtonListener';

export const ButtonEsc = ({ onCloseClick }: { onCloseClick?: () => void }) => {
  useEscapeButtonListener(onCloseClick);

  return (
    <Button type="tertiary" icon="Collapse" onClick={() => onCloseClick?.()}>
      <Shortcut keys={['Esc']} />
    </Button>
  );
};
