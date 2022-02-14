/*!
 * Copyright 2022 Cognite AS
 */
import { WantedSector, V9SectorMetadata } from '@reveal/cad-parsers';
import { BinaryFileProvider } from '@reveal/modeldata-api';
import { IMock, Mock, It } from 'moq.ts';

import * as fs from 'fs';

export const defaultBaseUrl = 'https://some_baseurl.com';
const modelIdentifier = 'some_model_identifier';

export function createWantedSectorMock(id: number = 1): IMock<WantedSector> {
  const wantedFile = 'wanted_file.glb';

  const mockedSectorMetadata = new Mock<V9SectorMetadata>()
    .setup(p => p.sectorFileName)
    .returns(wantedFile)
    .setup(p => p.id)
    .returns(id);

  return new Mock<WantedSector>()
    .setup(p => p.modelBaseUrl)
    .returns(defaultBaseUrl)
    .setup(p => p.modelIdentifier)
    .returns(modelIdentifier)
    .setup(p => p.metadata)
    .returns(mockedSectorMetadata.object());
}

export function createBinaryFileProviderMock(): IMock<BinaryFileProvider> {
  const fileBuffer = fs.readFileSync(__dirname + '/test.glb');
  return new Mock<BinaryFileProvider>()
    .setup(p => p.getBinaryFile(defaultBaseUrl, It.IsAny()))
    .returnsAsync(fileBuffer.buffer);
}
