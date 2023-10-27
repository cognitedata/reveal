import { Page } from '@fdx/modules/page/Page';
import { ThreeDSplitView } from '@fdx/modules/ThreeD/modules/ThreeDSplitView';

export const ThreeDPage = () => {
  return (
    <Page disableScrollbarGutter>
      <Page.Body fullscreen>
        <ThreeDSplitView />
      </Page.Body>
    </Page>
  );
};
