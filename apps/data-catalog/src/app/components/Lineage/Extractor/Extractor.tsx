import { FunctionComponent, PropsWithChildren } from 'react';

import { Chip } from '@cognite/cogs.js';

import { useTranslation } from '../../../common/i18n';
import { NoDataText, NoStyleList } from '../../../utils/styledComponents';

export interface ExtractorProps {
  extractorAccounts: string[];
}

export const Extractor: FunctionComponent<ExtractorProps> = ({
  extractorAccounts,
}: PropsWithChildren<ExtractorProps>) => {
  const { t } = useTranslation();
  return (
    <NoStyleList>
      {extractorAccounts && extractorAccounts.length ? (
        extractorAccounts.map((account: any) => (
          <li key={account}>
            <Chip size="x-small" hideTooltip label={account} />
          </li>
        ))
      ) : (
        <NoDataText>{t('no-extractors-set')}</NoDataText>
      )}
    </NoStyleList>
  );
};
