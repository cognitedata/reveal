import { Button, Tooltip } from '@cognite/cogs.js';
import { ComponentProps, useState } from 'react';

interface Props
  extends Omit<
    ComponentProps<typeof Button>,
    'aria-label' | 'icon' | 'onMouseEnter' | 'onMouseLeave' | 'onClick'
  > {
  onClick: () => Promise<boolean>;
}

export const CopyButton = ({ onClick, ...rest }: Props) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipContent, setTooltipContent] = useState('Copy to clipboard');

  const handleClick = async () => {
    if (await onClick()) setTooltipContent('Copied!');
    else setTooltipContent('Unable to copy');

    setShowTooltip(true);
  };

  return (
    <Tooltip visible={showTooltip} content={tooltipContent} appendTo="parent">
      <Button
        {...rest}
        aria-label="Copy text"
        icon="Copy"
        onClick={handleClick}
        onMouseEnter={() => {
          setShowTooltip(true);
          setTooltipContent('Copy to clipboard');
        }}
        onMouseLeave={() => setShowTooltip(false)}
      />
    </Tooltip>
  );
};
