import React, { useEffect } from 'react';
import keyboard, { KeyEvent } from 'keyboardjs';

type Props = {
  keys: string | string[];
  onKeyDown?: (event?: KeyEvent) => void;
  onKeyRelease?: (event?: KeyEvent) => void;
};

const KeyboardShortcut: React.FC<Props> = ({
  keys,
  onKeyDown = null,
  onKeyRelease,
}) => {
  useEffect(() => {
    keyboard.bind(keys, onKeyDown, onKeyRelease);
    return () => keyboard.unbind(keys, onKeyDown, onKeyRelease);
  }, [keys, onKeyDown, onKeyRelease]);

  return null; // No visual appearance
};

export default KeyboardShortcut;
