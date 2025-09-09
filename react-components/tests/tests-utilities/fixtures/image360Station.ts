import { type Image360Revision, type Image360, type ClassicDataSourceType } from '@cognite/reveal';
import { Mock } from 'moq.ts';

export const createMockImage360Entity = (
  revisions?: Image360Revision[]
): Image360<ClassicDataSourceType> =>
  new Mock<Image360>()
    .setup((p) => p.id)
    .returns('test-stationId')
    .setup((p) => p.label)
    .returns('Test Station Label')
    .setup((p) => p.getRevisions)
    .returns(() => revisions ?? [])
    .object();

export const createMockImage360Revision = (
  date: Date,
  thumbnailUrl: string
): Image360Revision<ClassicDataSourceType> =>
  new Mock<Image360Revision>()
    .setup((p) => p.date)
    .returns(date)
    .setup((p) => p.getPreviewThumbnailUrl)
    .returns(async () => thumbnailUrl)
    .object();
