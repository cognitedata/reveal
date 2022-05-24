import { FunctionComponent, PropsWithChildren } from 'react';
import styled from 'styled-components';
import { Extractor, ExtractorProps } from '../Extractor/Extractor';
import { Source, SourceProps } from '../Source/Source';
import { LineageSubTitle } from '../../../utils/styledComponents';
import { useTranslation } from 'common/i18n';

const ExtpipeSourceExtractorTitle = styled.h4`
  text-transform: uppercase;
`;
const Wrapper = styled.div`
  margin: 1rem 0 1rem 2rem;
  ul:not(:last-child) {
    margin-bottom: 2rem;
  }
`;
export type ExtpipeSourceExtractorProps = SourceProps & ExtractorProps;

export const ExtpipeSourceExtractor: FunctionComponent<ExtpipeSourceExtractorProps> =
  ({
    extractorAccounts,
    sourceNames,
  }: PropsWithChildren<ExtpipeSourceExtractorProps>) => {
    const { t } = useTranslation();
    return (
      <Wrapper>
        <ExtpipeSourceExtractorTitle>
          {t('source_one')}
        </ExtpipeSourceExtractorTitle>
        <LineageSubTitle>{t('lineage-source-text')}</LineageSubTitle>
        <Source sourceNames={sourceNames} />
        <ExtpipeSourceExtractorTitle>
          {t('extractor_one')}
        </ExtpipeSourceExtractorTitle>
        <LineageSubTitle>{t('lineage-extractor-text')}</LineageSubTitle>
        <Extractor extractorAccounts={extractorAccounts} />
      </Wrapper>
    );
  };
