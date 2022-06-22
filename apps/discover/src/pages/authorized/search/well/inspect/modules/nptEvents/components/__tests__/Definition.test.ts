import { screen } from '@testing-library/react';

import { testRenderer } from '__test-utils/renderer';

import { DEFINITION } from '../constants';
import { Definition } from '../Definition';

describe('Definition', () => {
  it('should render expected result', () => {
    testRenderer(Definition, undefined, { definition: 'test definition' });
    expect(screen.getByText(DEFINITION)).toBeInTheDocument();
    expect(screen.getByText('test definition')).toBeInTheDocument();
  });
});
