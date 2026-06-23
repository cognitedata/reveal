/*!
 * Copyright 2022 Cognite AS
 */
import type { WantedSector, SectorMetadata, ConsumedSector } from '@reveal/cad-parsers';
import { LevelOfDetail } from '@reveal/cad-parsers';
import type { BinaryFileProvider, ModelDataProvider } from '@reveal/data-providers';
import { LocalModelIdentifier } from '@reveal/data-providers';
import type { IMock } from 'moq.ts';
import { Mock, It } from 'moq.ts';

import * as fs from 'fs';

export const defaultBaseUrl = 'https://some_baseurl.com';
const modelIdentifier = new LocalModelIdentifier('some_model_identifier');

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
  const fileBuffer = fs.readFileSync(import.meta.dirname + '/test.glb');
  return new Mock<BinaryFileProvider>()
    .setup(p => p.getBinaryFile(defaultBaseUrl, It.IsAny(), It.IsAny()))
    .returnsAsync(fileBuffer.buffer);
}

export function createModelDataProviderMock(): IMock<ModelDataProvider> {
  const fileBuffer = fs.readFileSync(import.meta.dirname + '/test.glb');
  return new Mock<ModelDataProvider>()
    .setup(p => p.getBinaryFile(defaultBaseUrl, It.IsAny(), It.IsAny()))
    .returnsAsync(fileBuffer.buffer)
    .setup(p => p.getSignedBinaryFile(It.IsAny(), It.IsAny()))
    .returnsAsync(fileBuffer.buffer)
    .setup(p => p.getJsonFile(It.IsAny(), It.IsAny()))
    .returnsAsync({})
    .setup(p => p.getSignedJsonFile(It.IsAny()))
    .returnsAsync({})
    .setup(p => p.getDMSJsonFile(It.IsAny(), It.IsAny(), It.IsAny()))
    .returnsAsync({ signedFiles: { items: [] }, fileData: {} })
    .setup(p => p.getDMSJsonFileFromFileName(It.IsAny(), It.IsAny(), It.IsAny()))
    .returnsAsync({});
}
