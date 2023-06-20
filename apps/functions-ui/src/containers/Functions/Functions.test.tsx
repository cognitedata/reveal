/* eslint-disable testing-library/no-node-access */
/* eslint-disable testing-library/no-container */
import React from 'react';
import { MemoryRouter } from 'react-router';

import { cleanup, render, screen, fireEvent } from '@testing-library/react';

import sdk from '@cognite/cdf-sdk-singleton';

import { sleep } from '../../helpers';
import { CogFunction, Call } from '../../types/Types';
import TestWrapper from '../../utils/TestWrapper';

import Functions from './Functions';

const mockFunction = {
  name: 'testFunc',
  id: 1,
  createdTime: new Date(),
  owner: 'somebody@cognite.com',
  description: 'some description',
  status: 'Ready',
  externalId: 'externalid',
} as unknown as CogFunction;
const mockCall = {
  id: 100,
  startTime: new Date(),
  endTime: new Date(),
  status: 'Completed',
} as unknown as Call;
const mockFunction2 = {
  fileId: 1,
  name: 'secondFunc',
  id: 2,
  createdTime: new Date(),
  owner: 'somebody@cognite.com',
  description: 'some description',
  status: 'Ready',
} as unknown as CogFunction;

jest.mock('@cognite/cdf-sdk-singleton', () => ({
  __esModule: true,
  default: {
    get: jest.fn((url: string) => {
      if (url.includes('/status')) {
        return Promise.resolve({
          data: { status: 'activated' },
        });
      }
      return Promise.resolve({
        data: { items: [mockFunction, mockFunction2] },
      });
    }),
    post: jest.fn(() =>
      Promise.resolve({
        data: { items: [mockCall] },
      })
    ),
  },
}));

jest.mock('@cognite/cdf-utilities', () => ({
  PageTitle: () => null,
  getProject: () => 'mockProject',
}));

const wrap = (node: React.ReactNode) =>
  render(<TestWrapper>{node}</TestWrapper>);

const loadMock = (sdkToMock: any) => {
  jest.spyOn(sdkToMock, 'get').mockImplementation((url: any) => {
    if (url.includes('/status')) {
      return Promise.resolve({
        data: { status: 'activated' },
      });
    }
    return Promise.resolve({
      data: { items: [mockFunction, mockFunction2] },
    });
  });
};

describe('Functions', () => {
  beforeEach(() => {
    (sdk.get as any).mockClear();
    cleanup();
  });
  it('renders without crashing', () => {
    expect(() => {
      const view = wrap(
        <MemoryRouter>
          <Functions />
        </MemoryRouter>
      );
      view.unmount();
    }).not.toThrow();
  });

  it('should load functions and calls upon mount and refresh them', async () => {
    const useEffect = jest.spyOn(React, 'useEffect');
    // sdk.get = jest.fn();
    loadMock(sdk);

    const { container } = wrap(<Functions />);

    await sleep(100);

    expect(useEffect).toHaveBeenCalled();
    expect(sdk.get).toHaveBeenCalled();

    expect(sdk.get).toHaveBeenCalledWith(
      'api/v1/projects/mockProject/functions/status'
    );

    const refreshButton = screen.getByRole('button', {
      name: /refresh/i,
    });
    fireEvent.click(refreshButton);
    expect(refreshButton).toBeDefined();

    expect(sdk.get).toHaveBeenCalledWith(
      '/api/v1/projects/mockProject/functions'
    );

    // 'should update functions shown if search field is filled'
    expect(await screen.findAllByText('testFunc')).toHaveLength(1);

    const functionsDisplayed =
      container.getElementsByClassName('ant-collapse-item');

    expect(functionsDisplayed.length).toBe(2);
    const search = screen.getByPlaceholderText(
      'Search by name, external id, or owner'
    );
    fireEvent.change(search, { target: { value: 'second' } });
    const functionsDisplayedAfterSearch =
      container.getElementsByClassName('ant-collapse-item');

    expect(functionsDisplayedAfterSearch).toHaveLength(1);

    fireEvent.change(search, { target: { value: '' } });

    // 'search field is case insensitive'

    const functionsDisplayed1 =
      container.getElementsByClassName('ant-collapse-item');
    expect(functionsDisplayed1.length).toBe(2);
    const search1 = screen.getByPlaceholderText(
      'Search by name, external id, or owner'
    );
    fireEvent.change(search1, { target: { value: 'SECOND' } });
    const functionsDisplayedAfterSearch1 =
      container.getElementsByClassName('ant-collapse-item');

    expect(functionsDisplayedAfterSearch1).toHaveLength(1);
  });
});
