import { FunctionComponent, PropsWithChildren } from 'react';
import styled from 'styled-components';
import {
  Extractor,
  EXTRACTOR_TEXT,
  ExtractorProps,
} from '../Extractor/Extractor';
import { Source, SOURCE_TEXT, SourceProps } from '../Source/Source';
import { LineageSubTitle } from '../../../utils/styledComponents';

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
    return (
      <Wrapper>
        <ExtpipeSourceExtractorTitle>Source</ExtpipeSourceExtractorTitle>
        <LineageSubTitle>{SOURCE_TEXT}</LineageSubTitle>
        <Source sourceNames={sourceNames} />
        <ExtpipeSourceExtractorTitle>Extractor</ExtpipeSourceExtractorTitle>
        <LineageSubTitle>{EXTRACTOR_TEXT}</LineageSubTitle>
        <Extractor extractorAccounts={extractorAccounts} />
      </Wrapper>
    );
  };
