import { render, screen } from '@testing-library/react';
import noop from 'lodash/noop';

import { BlockExpander } from './BlockExpander';

describe('BlockExpander', () => {
  const props = { text: 'Click to expand filters', onClick: noop };

  const renderTest = () => {
    return render(<BlockExpander {...props} />);
  };

  it('renders header', () => {
    renderTest();
    expect(screen.getByText(props.text)).toBeInTheDocument();
  });
});
