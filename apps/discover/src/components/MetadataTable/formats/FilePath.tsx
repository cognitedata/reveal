import React, { useState } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import { useTranslation } from 'react-i18next';

import isString from 'lodash/isString';

import { Button, Tooltip } from '@cognite/cogs.js';

import { useGlobalMetrics } from 'hooks/useGlobalMetrics';

import { PathContainer, PathText } from '../elements';

export const convertPath = (path: string) => {
  if (!path || path.length < 1) {
    return '';
  }
  const matches = path.match(/^[a-z]-drive/gi);
  if (matches) {
    const result = path.replace('-drive', ':');
    return result;
  }
  return path;
};

export const FilePath: React.FC = ({ children }) => {
  const metrics = useGlobalMetrics('feedback');
  const { t } = useTranslation('Documents');
  const title = t('Copy to clipboard');
  const [tooltip, setTooltip] = useState(title);

  const handleCopyToClipboard = (_text: string, result: boolean) => {
    metrics.track('click-copy-document-title-button');

    if (result) {
      setTooltip(t('Copied'));
      setTimeout(() => setTooltip(title), 1000);
    } else {
      setTooltip(t('Unable to copy path to clipboard'));
      setTimeout(() => setTooltip(title), 4000);
    }
  };

  return (
    <PathContainer>
      <PathText>{children}</PathText>

      {/* 
        We only want to render the copy button when it's a text. 
        When it's react-children it just renders the children.
      */}
      {isString(children) && (
        <Tooltip content={tooltip}>
          <CopyToClipboard
            text={convertPath(children)}
            onCopy={handleCopyToClipboard}
          >
            <Button
              aria-label="Copy path"
              icon="Copy"
              size="small"
              type="ghost"
            />
          </CopyToClipboard>
        </Tooltip>
      )}
    </PathContainer>
  );
};
