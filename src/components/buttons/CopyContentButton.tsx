import React from 'react';
import { Button, HtmlElementProps, Tooltip } from '@cognite/cogs.js';

type Props = {
  value: string;
} & Pick<HtmlElementProps, 'style'>;

export default function CopyContentButton({ value, style }: Props) {
  return (
    <>
      <Tooltip placement="top" content="Click to copy to clipboard">
        <Button
          icon="Copy"
          size="small"
          style={{ ...style, padding: '4px' }}
          onClick={() => {
            navigator.clipboard.writeText(value);
          }}
        />
      </Tooltip>
    </>
  );
}
