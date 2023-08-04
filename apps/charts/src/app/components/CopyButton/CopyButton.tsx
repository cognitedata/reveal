import { ComponentProps, MouseEventHandler, useState } from 'react';

import { Button, Colors } from '@cognite/cogs.js';

type Props = ComponentProps<typeof Button> & {
  value: string;
};

const CopyButton = ({ value, ...rest }: Props) => {
  const [iconType, setIconType] = useState<'Copy' | 'Checkmark'>('Copy');

  const copyValue: MouseEventHandler<HTMLButtonElement> = async (e) => {
    e.preventDefault();
    await navigator.clipboard.writeText(value);
    setIconType('Checkmark');
    setTimeout(() => setIconType('Copy'), 3000);
  };
  return (
    <Button
      type="ghost"
      aria-label={`copy value ${value}`}
      icon={iconType}
      onClick={copyValue}
      {...rest}
      style={{
        transition: 'color 500ms ease-in ease-out',
        color:
          iconType === 'Copy'
            ? Colors['surface--action--strong--default']
            : Colors['text-icon--status-success'],
        ...rest.style,
      }}
    />
  );
};

export default CopyButton;
