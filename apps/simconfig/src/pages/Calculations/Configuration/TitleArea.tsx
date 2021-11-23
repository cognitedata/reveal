import { Title } from '@cognite/cogs.js';

import {
  BLabel,
  ItemWrapper,
  TitleContainer,
  TitleRowFlexEnd,
} from '../elements';
import { CalculationConfig } from '../../../components/forms/ConfigurationForm/types';

interface ComponentProps {
  fileData?: CalculationConfig;
}

export default function TitleArea({
  fileData,
  children,
}: React.PropsWithChildren<ComponentProps>) {
  return (
    <>
      <TitleContainer>
        <Title>{fileData?.modelName}</Title>
        <ItemWrapper>
          <BLabel>Calculation Name</BLabel>
          {fileData?.calculationName}
        </ItemWrapper>
        <ItemWrapper>
          <BLabel>Simulator</BLabel>
          {fileData?.simulator}
        </ItemWrapper>
      </TitleContainer>
      <TitleRowFlexEnd>{children}</TitleRowFlexEnd>
    </>
  );
}
