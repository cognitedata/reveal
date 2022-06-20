import React from 'react';
import { shallow } from 'enzyme';
import NewHeader from './NewHeader';

global.window = { location: { pathname: null } };

describe('NewHeader', () => {
  it('Renders without exploding', () => {
    const wrapper = shallow(<NewHeader />);
    expect(wrapper).toHaveLength(1);
  });

  it('renders the title with ornament color', () => {
    const wrapper = shallow(
      <NewHeader title="Extractors" ornamentColor="yellow" />
    );
    expect(wrapper.props().children).toHaveLength(2);
  });
});
