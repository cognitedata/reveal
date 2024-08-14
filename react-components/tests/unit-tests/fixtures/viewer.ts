import { vi } from 'vitest';

import { Cognite3DViewer, CogniteModel, Image360Collection } from '@cognite/reveal';
import { Mock, It } from 'moq.ts';

const domElement = document.createElement('div').appendChild(document.createElement('canvas'));

export const viewerModelsMock = vi.fn<[], CogniteModel[]>();
export const viewerRemoveModelsMock = vi.fn<[CogniteModel], void>();
export const viewerImage360CollectionsMock = vi.fn<[], Image360Collection[]>();

export const viewerMock = new Mock<Cognite3DViewer>()
  .setup((viewer) => viewer.setBackgroundColor(It.IsAny()))
  .returns()
  .setup((viewer) => viewer.domElement)
  .returns(domElement)
  .setup((p) => p.models)
  .callback(viewerModelsMock)
  .setup((p) => p.get360ImageCollections())
  .callback(viewerImage360CollectionsMock)
  .setup((p) => p.removeModel)
  .returns(viewerRemoveModelsMock)
  .object();
