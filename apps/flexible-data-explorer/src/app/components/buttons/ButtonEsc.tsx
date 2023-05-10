import { Button, Shortcut } from '@cognite/cogs.js';
import { useEffect } from 'react';

export const ButtonEsc = ({ onCloseClick }: { onCloseClick?: () => void }) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.code === 'Escape') {
        onCloseClick?.();
      }
    };

    window.addEventListener('keydown', handleEsc);

    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, []);

  return (
    <Button type="tertiary" icon="Collapse" onClick={() => onCloseClick?.()}>
      <Shortcut keys={['Esc']} />
    </Button>
  );
};
