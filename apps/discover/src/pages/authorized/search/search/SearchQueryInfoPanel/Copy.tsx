import CopyToClipboard from 'react-copy-to-clipboard';
import { useTranslation } from 'react-i18next';

import isString from 'lodash/isString';

import { Tooltip } from '@cognite/cogs.js';

import { useGlobalMetrics } from 'hooks/useGlobalMetrics';

import { CopyToClipboardStyle } from './elements';

interface Props {
  text?: string;
  children: unknown;
}
export const Copy: React.FC<Props> = ({ text, children }) => {
  const { t } = useTranslation('Search');
  const metrics = useGlobalMetrics('search');

  const trackAction = () => {
    metrics.track('click-copy-search-syntax-button');
  };

  return (
    <Tooltip content={t('Click to copy')} placement="bottom">
      <CopyToClipboard
        onCopy={trackAction}
        text={text || (isString(children) && children) || ''}
      >
        <CopyToClipboardStyle>{children}</CopyToClipboardStyle>
      </CopyToClipboard>
    </Tooltip>
  );
};
