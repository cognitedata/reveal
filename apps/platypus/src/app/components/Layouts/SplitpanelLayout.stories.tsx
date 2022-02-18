import {
  MainDescription,
  MainTitle,
} from '@platypus-app/components/Styles/storybook';
import { SplitPanelLayout } from './SplitPanelLayout';

export default {
  title: 'Basic components/SplitPanelLayout',
  component: SplitPanelLayout,
};

export const Base = () => {
  const sidebar = (
    <div style={{ padding: '10px' }}>
      <MainTitle>Split panel Sidebebar</MainTitle>
      <MainDescription title="Where is it used?">
        This is the resizable panel where you would usually have a collection of
        items.
      </MainDescription>
    </div>
  );
  const content = (
    <div style={{ padding: '10px' }}>
      <MainTitle>Split panel content</MainTitle>
      <MainDescription title="Where is it used?">
        The content will be shown here usually when something is selected from
        sidebar
      </MainDescription>
    </div>
  );
  return (
    <SplitPanelLayout
      sidebar={sidebar}
      sidebarWidth={400}
      sidebarMinWidth={300}
      content={content}
    />
  );
};
