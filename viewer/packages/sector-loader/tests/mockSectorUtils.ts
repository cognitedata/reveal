/*!
 * Copyright 2022 Cognite AS
 */
import { WantedSector, SectorMetadata, ConsumedSector, LevelOfDetail } from '@reveal/cad-parsers';
import { BinaryFileProvider, LocalModelIdentifier } from '@reveal/data-providers';
import { IMock, Mock, It } from 'moq.ts';

import * as fs from 'fs';

export const defaultBaseUrl = 'https://some_baseurl.com';
const modelIdentifier = new LocalModelIdentifier('some_model_identifier');

// https://blog.logrocket.com/alternatives-dirname-node-js-es-modules/
import url from 'url';
const __dirname = url.fileURLToPath(new url.URL('.', import.meta.url));

export function createWantedSectorMock(id: number = 1): IMock<WantedSector> {
  const wantedFile = 'wanted_file.glb';

  const mockedSectorMetadata = new Mock<SectorMetadata>()
    .setup(p => p.sectorFileName)
    .returns(wantedFile)
    .setup(p => p.id)
    .returns(id);

  return new Mock<WantedSector>()
    .setup(p => p.modelBaseUrl)
    .returns(defaultBaseUrl)
    .setup(p => p.signedFilesBaseUrl)
    .returns(defaultBaseUrl)
    .setup(p => p.modelIdentifier)
    .returns(modelIdentifier)
    .setup(p => p.metadata)
    .returns(mockedSectorMetadata.object());
}

export function createMockedConsumedSector(): IMock<ConsumedSector> {
  return new Mock<ConsumedSector>()
    .setup(x => x.modelIdentifier)
    .returns(modelIdentifier)
    .setup(x => x.levelOfDetail)
    .returns(LevelOfDetail.Detailed)
    .setup(x => x.instancedMeshes)
    .returns(undefined);
}

export function createBinaryFileProviderMock(): IMock<BinaryFileProvider> {
  const fileBuffer = fs.readFileSync(__dirname + '/test.glb');
  return new Mock<BinaryFileProvider>()
    .setup(p => p.getBinaryFile(defaultBaseUrl, It.IsAny(), It.IsAny()))
    .returnsAsync(fileBuffer.buffer);
}
