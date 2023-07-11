import { Button, Shortcut } from '@cognite/cogs.js';

import { useEscapeKeyListener } from '../../hooks/listeners/useKeyboardListener';

export const ButtonEsc = ({ onCloseClick }: { onCloseClick?: () => void }) => {
  useEscapeKeyListener(onCloseClick);

  return (
    <Button type="tertiary" icon="Collapse" onClick={() => onCloseClick?.()}>
      <Shortcut keys={['Esc']} />
    </Button>
  );
};
