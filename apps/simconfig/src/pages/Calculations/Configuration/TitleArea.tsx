import { Title } from '@cognite/cogs.js';
import GoBackButton from 'components/app/GoBackButton';
import { PAGES } from 'pages/Menubar';

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
  // TODO(SIM-176) Improve routing and missing content
  if (!fileData?.modelName) {
    return null;
  }

  return (
    <>
      <TitleContainer>
        <GoBackButton
          URL={PAGES.CALCULATION_LIBRARY.replace(
            ':modelName',
            fileData.modelName
          )}
        />
        <Title>{fileData.modelName}</Title>
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
