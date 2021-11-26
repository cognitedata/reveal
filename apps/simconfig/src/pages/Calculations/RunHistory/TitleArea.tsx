import { Title } from '@cognite/cogs.js';
import { FileInfoSerializable } from 'store/file/types';
import { PAGES } from 'pages/Menubar';
import GoBackButton from 'components/app/GoBackButton';
import {
  BLabel,
  ItemWrapper,
  TitleContainer,
  TitleRowFlexEnd,
  TitleRowFlexStart,
} from 'pages/Calculations/elements';
import { useRouteMatch } from 'react-router-dom';

interface ComponentProps {
  fileData?: FileInfoSerializable;
}

export default function TitleArea({
  fileData,
  children,
}: React.PropsWithChildren<ComponentProps>) {
  // TODO(SIM-176) Improve routing and missing content
  if (!fileData?.metadata?.modelName) {
    return null;
  }

  const returnUrl = useRouteMatch(PAGES.CALCULATION_LIBRARY)?.url || '/';

  return (
    <>
      <TitleContainer>
        <GoBackButton URL={returnUrl} />
        <Title>{fileData?.metadata?.modelName}</Title>
        <ItemWrapper>
          <BLabel>Calculation type</BLabel>
          {fileData?.metadata?.calcName}
        </ItemWrapper>
        <ItemWrapper>
          <BLabel>Simulator</BLabel>
          {fileData?.source}
        </ItemWrapper>
      </TitleContainer>
      <TitleRowFlexStart>
        <Title level={2}>Run History</Title>
      </TitleRowFlexStart>
      <TitleRowFlexEnd>{children}</TitleRowFlexEnd>
    </>
  );
}
