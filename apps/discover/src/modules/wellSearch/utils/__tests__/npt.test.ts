/* eslint-disable jest/no-conditional-expect */
import { render, screen } from '@testing-library/react';

import {
  ACTION_MESSAGE,
  DEFINITION,
  NO_DEFINITION,
} from 'pages/authorized/search/well/inspect/modules/nptEvents/components/constants';

import { nptDataMapToMultiSelect } from '../npt';

describe('nptDataMapToMultiSelect', () => {
  const testObject = {
    code_1: 'test value',
    code_2: 'test value 2',
    code_3: 'test value 3',
  };

  it('should return empty result', () => {
    expect(nptDataMapToMultiSelect([])).toEqual([]);
  });

  it('should return expected result with valid input', () => {
    const testCodeList = ['code_1', 'code_2'];
    const result = nptDataMapToMultiSelect(testCodeList, testObject);

    if (result[0].helpText && typeof result[0].helpText !== 'string') {
      render(result[0].helpText);
      expect(screen.getByText(DEFINITION)).toBeInTheDocument();
      expect(screen.getByText('test value')).toBeInTheDocument();
    }

    expect(result[0].value).toEqual(testCodeList[0]);
    expect(result[1].value).toEqual(testCodeList[1]);
  });

  it('should return expected result with invalid input', () => {
    const testCodeList = ['code_4'];
    const result = nptDataMapToMultiSelect(testCodeList, testObject);

    if (result[0].helpText && typeof result[0].helpText !== 'string') {
      render(result[0].helpText);
      expect(screen.getByText(NO_DEFINITION)).toBeInTheDocument();
      expect(screen.getByText(ACTION_MESSAGE)).toBeInTheDocument();
    }

    expect(result[0].value).toEqual(testCodeList[0]);
  });
});
