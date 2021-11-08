import { Title } from '@cognite/cogs.js';
import { FileInfoSerializable } from 'store/file/types';
import {
  BLabel,
  ItemWrapper,
  TitleContainer,
  TitleRowFlexEnd,
  TitleRowFlexStart,
} from 'pages/Calculations/elements';

interface ComponentProps {
  fileData?: FileInfoSerializable;
}

export default function TitleArea({
  fileData,
  children,
}: React.PropsWithChildren<ComponentProps>) {
  return (
    <>
      <TitleContainer>
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
