import { useTranslation } from 'common/i18n';
import { FunctionComponent, PropsWithChildren } from 'react';
import {
  LineageTag,
  NoDataText,
  NoStyleList,
} from '../../../utils/styledComponents';

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
            <LineageTag>{account}</LineageTag>
          </li>
        ))
      ) : (
        <NoDataText>{t('no-extractors-set')}</NoDataText>
      )}
    </NoStyleList>
  );
};
