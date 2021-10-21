import { Title } from '@cognite/cogs.js';
import { FileInfoSerializable } from 'store/file/types';

import {
  BLabel,
  ItemWrapper,
  TitleContainer,
  TitleRowFlexEnd,
} from './elements';

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
        <Title>{fileData?.name}</Title>
        <ItemWrapper>
          <BLabel>Simulator</BLabel>
          {fileData?.source}
        </ItemWrapper>
        <ItemWrapper>
          <BLabel>Version</BLabel>
          {fileData?.metadata?.version}
        </ItemWrapper>
        <ItemWrapper>
          <BLabel>File Name</BLabel>
          {fileData?.metadata?.fileName}
        </ItemWrapper>
      </TitleContainer>
      <TitleRowFlexEnd>{children}</TitleRowFlexEnd>
    </>
  );
}
