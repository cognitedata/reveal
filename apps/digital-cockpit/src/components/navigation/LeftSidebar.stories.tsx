import configureStory from 'storybook/configureStory';
import { mockSuitesTable } from '__mocks/suites';
import LeftSidebar from './LeftSidebar';

export default {
  title: 'Layout/LeftSidebar',
};

export const Base = () => (
  <div style={{ height: '100%' }}>
    <LeftSidebar />
  </div>
);

Base.story = configureStory({
  redux: {
    config: {
      applications: ['maintain'],
    },
    suitesTable: mockSuitesTable,
  },
});
