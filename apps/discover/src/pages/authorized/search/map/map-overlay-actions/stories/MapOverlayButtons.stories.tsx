import noop from 'lodash/noop';

import { getMockedAssets } from '__test-utils/fixtures/map';

import { ContentSelector } from '../ContentSelector';

export default {
  title: 'Components / map/MapOverlayActions',
  component: ContentSelector,
  decorators: [
    (storyFn: any) => (
      <div
        style={{ position: 'relative', height: 200, backgroundColor: 'gray' }}
      >
        {storyFn()}
      </div>
    ),
  ],
};

export const Basic = () => {
  const assets = getMockedAssets;

  return (
    <ContentSelector assets={assets} zoomToAsset={noop} selectedLayers={[]} />
  );
};
