import { Page } from '../containers/page/Page';
import { ThreeDSplitView } from '../containers/ThreeD/containers/ThreeDSplitView';

export const ThreeDPage = () => {
  return (
    <Page disableScrollbarGutter>
      <Page.Body fullscreen>
        <ThreeDSplitView />
      </Page.Body>
    </Page>
  );
};
