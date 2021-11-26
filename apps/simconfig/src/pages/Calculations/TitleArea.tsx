import { Title } from '@cognite/cogs.js';
import { FileInfoSerializable } from 'store/file/types';
import GoBackButton from 'components/app/GoBackButton';
import { PAGES } from 'pages/Menubar';

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
  // TODO(SIM-176) Improve routing and missing content
  if (!fileData?.metadata?.modelName) {
    return null;
  }

  return (
    <>
      <TitleContainer>
        <GoBackButton
          URL={PAGES.MODEL_LIBRARY_VERSION.replace(
            ':modelName',
            fileData.metadata.modelName
          )}
        />
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
