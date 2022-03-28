import { FunctionComponent, PropsWithChildren } from 'react';
import {
  LineageTag,
  NoDataText,
  NoStyleList,
} from '../../../utils/styledComponents';

export const EXTRACTOR_TEXT: Readonly<string> =
  'The service accounts/service accounts IDs below are used in data extraction.';
export interface ExtractorProps {
  extractorAccounts: string[];
}

export const Extractor: FunctionComponent<ExtractorProps> = ({
  extractorAccounts,
}: PropsWithChildren<ExtractorProps>) => {
  return (
    <NoStyleList>
      {extractorAccounts && extractorAccounts.length ? (
        extractorAccounts.map((account: any) => (
          <li key={account}>
            <LineageTag>{account}</LineageTag>
          </li>
        ))
      ) : (
        <NoDataText>No extractors set</NoDataText>
      )}
    </NoStyleList>
  );
};
