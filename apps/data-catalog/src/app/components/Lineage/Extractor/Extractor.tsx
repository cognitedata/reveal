import { useTranslation } from '@data-catalog-app/common/i18n';
import { FunctionComponent, PropsWithChildren } from 'react';
import { NoDataText, NoStyleList } from '../../../utils/styledComponents';
import { Chip } from '@cognite/cogs.js';

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
