import { Page } from '../containers/page/Page';
import { ThreeDContent } from '../containers/ThreeD/ThreeDContent';

export const ThreeDPage = () => {
  return (
    <Page>
      <Page.Body fullscreen>
        <ThreeDContent />
      </Page.Body>
    </Page>
  );
};
