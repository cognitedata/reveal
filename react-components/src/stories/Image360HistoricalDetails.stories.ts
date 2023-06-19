import type { Meta, StoryObj } from '@storybook/react';
import { Image360HistoricalDetails } from '../components/View';
import { It, Mock } from 'moq.ts';
import { Cognite3DViewer, Image360, Image360Revision } from '@cognite/reveal';

const meta = {
  title: 'Example/Image360HistoricalDetails',
  component: Image360HistoricalDetails,
  tags: ['autodocs'],
} satisfies Meta<typeof Image360HistoricalDetails>;

export default meta;
type Story = StoryObj<typeof meta>;

const revisionMocks = [
  new Mock<Image360Revision>()
    .setup(p => p.getPreviewThumbnailUrl())
    .returns(Promise.resolve(undefined))
    .object(),
  new Mock<Image360Revision>()
    .setup(p => p.getPreviewThumbnailUrl())
    .returns(Promise.resolve(undefined))
    .object(),
  new Mock<Image360Revision>()
    .setup(p => p.getPreviewThumbnailUrl())
    .returns(Promise.resolve(undefined))
    .object(),
  new Mock<Image360Revision>()
    .setup(p => p.getPreviewThumbnailUrl())
    .returns(Promise.resolve(undefined))
    .object(),
  new Mock<Image360Revision>()
    .setup(p => p.getPreviewThumbnailUrl())
    .returns(Promise.resolve(undefined))
    .object(),
]

const viewerMock = new Mock<Cognite3DViewer>()
  .setup(p => p.enter360Image(It.IsAny()))
  .returns(Promise.resolve());
const image360Mock = new Mock<Image360>()
  .setup(p => p.getRevisions())
  .returns(revisionMocks);

export const Main: Story = {
  args: {
    viewer: viewerMock.object(),
    image360Entity: image360Mock.object()
  }
};
