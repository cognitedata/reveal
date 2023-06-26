import type { Meta, StoryObj } from '@storybook/react';
import { Image360HistoricalDetails } from '../src';
import { It, Mock } from 'moq.ts';
import { type Cognite3DViewer, type Image360, type Image360Revision } from '@cognite/reveal';

const meta = {
  title: 'Example/Image360HistoricalDetails',
  component: Image360HistoricalDetails,
  tags: ['autodocs']
} satisfies Meta<typeof Image360HistoricalDetails>;

export default meta;
type Story = StoryObj<typeof meta>;

const revisionMocks = [
  new Mock<Image360Revision>()
    .setup(async (p) => await p.getPreviewThumbnailUrl())
    .returns(Promise.resolve(undefined))
    .setup((p) => p.date)
    .returns(undefined)
    .object(),
  new Mock<Image360Revision>()
    .setup(async (p) => await p.getPreviewThumbnailUrl())
    .returns(Promise.resolve(undefined))
    .setup((p) => p.date)
    .returns(new Date('2024.01.13 13:23'))
    .object(),
  new Mock<Image360Revision>()
    .setup(async (p) => await p.getPreviewThumbnailUrl())
    .returns(Promise.resolve(undefined))
    .setup((p) => p.date)
    .returns(new Date('2025.01.14 13:23'))
    .object(),
  new Mock<Image360Revision>()
    .setup(async (p) => await p.getPreviewThumbnailUrl())
    .returns(Promise.resolve(undefined))
    .setup((p) => p.date)
    .returns(new Date('2026.01.15 15:23'))
    .object(),
  new Mock<Image360Revision>()
    .setup(async (p) => await p.getPreviewThumbnailUrl())
    .returns(Promise.resolve(undefined))
    .setup((p) => p.date)
    .returns(new Date('2024.01.16 23:23'))
    .object()
];

const viewerMock = new Mock<Cognite3DViewer>()
  .setup(async (p) => {
    await p.enter360Image(It.IsAny());
  })
  .returns(Promise.resolve());
const image360Mock = new Mock<Image360>()
  .setup((p) => p.getRevisions())
  .returns(revisionMocks)
  .setup((p) => p.id)
  .returns('Station-Id')
  .setup((p) => p.label)
  .returns('Station Name');

export const Main: Story = {
  args: {
    viewer: viewerMock.object(),
    image360Entity: image360Mock.object()
  }
};
