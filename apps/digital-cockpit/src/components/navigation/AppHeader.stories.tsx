import configureStory from 'storybook/configureStory';
import { mockGroupStateAdmin } from '__mocks/groups';
import AppHeader from './AppHeader';

export default {
  title: 'Layout/AppHeader',
};

export const Base = () => <AppHeader />;

Base.story = configureStory({
  redux: {
    groups: mockGroupStateAdmin,
  },
});
