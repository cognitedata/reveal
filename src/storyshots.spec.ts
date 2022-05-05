import initStoryshots, { renderWithOptions } from '@storybook/addon-storyshots';
import { mount, configure } from 'enzyme';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';

configure({ adapter: new Adapter() });

initStoryshots({
  test: renderWithOptions({
    renderer: mount,
  }),
});
