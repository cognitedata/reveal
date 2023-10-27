import { useEscapeKeyListener } from '@fdx/shared/hooks/listeners/useKeyboardListener';

import { Button, Shortcut } from '@cognite/cogs.js';

export const ButtonEsc = ({ onCloseClick }: { onCloseClick?: () => void }) => {
  useEscapeKeyListener(onCloseClick);

  return (
    <Button type="tertiary" icon="Collapse" onClick={() => onCloseClick?.()}>
      <Shortcut keys={['Esc']} />
    </Button>
  );
};
