import { type ReactElement } from 'react';
import { type HelpSectionProps } from './types';
import {
  SectionContainer,
  SectionTitle,
  SectionSubTitle,
  InstructionDetail,
  SectionContent
} from './elements';

export const Section = ({
  children,
  title,
  description,
  subTitle
}: HelpSectionProps): ReactElement => (
  <SectionContainer>
    <SectionTitle>{title}</SectionTitle>
    <SectionSubTitle>{subTitle}</SectionSubTitle>
    <InstructionDetail>{description}</InstructionDetail>
    <SectionContent>{children}</SectionContent>
  </SectionContainer>
);
