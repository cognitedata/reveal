/*!
 * Copyright 2023 Cognite AS
 */

import { type ReactElement } from 'react';
import { type HelpMenuSectionProps } from './types';
import {
  SectionContainer,
  SectionTitle,
  SectionSubTitle,
  InstructionDetail,
  SectionContent
} from './elements';

export const MenuSection = ({
  children,
  title,
  description,
  subTitle
}: HelpMenuSectionProps): ReactElement => (
  <SectionContainer>
    <SectionTitle>{title}</SectionTitle>
    <SectionSubTitle>{subTitle}</SectionSubTitle>
    <InstructionDetail>{description}</InstructionDetail>
    <SectionContent>{children}</SectionContent>
  </SectionContainer>
);
