import CopyToClipboard from 'react-copy-to-clipboard';
import isString from 'lodash/isString';
import { Tooltip } from '@cognite/cogs.js';
import React from 'react';

import { CopyToClipboardStyle } from './elements';

interface Props {
  text?: string;
}
export const Copy: React.FC<React.PropsWithChildren<Props>> = ({
  text,
  children,
}) => {
  return (
    <Tooltip content="Click to copy" placement="bottom">
      <CopyToClipboard text={text || (isString(children) && children) || ''}>
        <CopyToClipboardStyle>{children}</CopyToClipboardStyle>
      </CopyToClipboard>
    </Tooltip>
  );
};
