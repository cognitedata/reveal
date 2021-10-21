import React, { FunctionComponent, PropsWithChildren } from 'react';
import styled from 'styled-components';
import {
  Extractor,
  EXTRACTOR_TEXT,
  ExtractorProps,
} from '../Extractor/Extractor';
import { Source, SOURCE_TEXT, SourceProps } from '../Source/Source';
import { LineageSubTitle } from '../../../utils/styledComponents';

const IntegrationSourceExtractorTitle = styled.h4`
  text-transform: uppercase;
`;
const Wrapper = styled.div`
  margin: 1rem 0 1rem 2rem;
  ul:not(:last-child) {
    margin-bottom: 2rem;
  }
`;
export type IntegrationSourceExtractorProps = SourceProps & ExtractorProps;

export const IntegrationSourceExtractor: FunctionComponent<IntegrationSourceExtractorProps> =
  ({
    extractorAccounts,
    sourceNames,
  }: PropsWithChildren<IntegrationSourceExtractorProps>) => {
    return (
      <Wrapper>
        <IntegrationSourceExtractorTitle>
          Source
        </IntegrationSourceExtractorTitle>
        <LineageSubTitle>{SOURCE_TEXT}</LineageSubTitle>
        <Source sourceNames={sourceNames} />
        <IntegrationSourceExtractorTitle>
          Extractor
        </IntegrationSourceExtractorTitle>
        <LineageSubTitle>{EXTRACTOR_TEXT}</LineageSubTitle>
        <Extractor extractorAccounts={extractorAccounts} />
      </Wrapper>
    );
  };
