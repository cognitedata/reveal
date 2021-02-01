import React from 'react';
import { render } from 'utils/test';
import { screen } from '@testing-library/react';
import { MetaData } from './MetaData';
import { uppercaseFirstWord } from '../../utils/primitivesUtils';
import { NO_META_DATA } from '../../utils/constants';

describe('MetaData', () => {
  test('Should render metadata', () => {
    const metadata = { sourceSystem: 'Azure' };
    render(<MetaData metadata={metadata} />);
    Object.entries(metadata).forEach(([k, v]) => {
      expect(
        screen.getByText(new RegExp(uppercaseFirstWord(k), 'i'))
      ).toBeInTheDocument();
      expect(screen.getByText(new RegExp(v, 'i'))).toBeInTheDocument();
    });
  });

  test('Should render no meta data when undefined', () => {
    const metadata = undefined;
    render(<MetaData metadata={metadata} />);
    expect(screen.getByText(NO_META_DATA)).toBeInTheDocument();
  });
});
