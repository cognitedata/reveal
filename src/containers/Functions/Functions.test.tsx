import React from 'react';
import ReactDOM from 'react-dom';

import { MemoryRouter } from 'react-router';
import { CogFunction, Call } from 'types/Types';
import { mount } from 'enzyme';

import { sleep } from 'helpers';
import TestWrapper from 'utils/TestWrapper';
import sdk from 'sdk-singleton';
import Functions from './Functions';

jest.mock('@cognite/cdf-utilities', () => ({
  PageTitle: () => null,
}));

const wrap = (node: React.ReactNode) =>
  mount(<TestWrapper>{node}</TestWrapper>);


describe('Functions', () => {

  const mockFunction = {
    name: 'testFunc',
    id: 1,
    createdTime: new Date(),
    owner: 'somebody@cognite.com',
    description: 'some description',
    status: 'Ready',
    externalId: 'externalid',
  } as CogFunction;
  const mockCall = {
    id: 100,
    startTime: new Date(),
    endTime: new Date(),
    status: 'Completed',
  } as Call;
  const mockFunction2 = {
    fileId: 1,
    name: 'secondFunc',
    id: 2,
    createdTime: new Date(),
    owner: 'somebody@cognite.com',
    description: 'some description',
    status: 'Ready',
  } as CogFunction;

  sdk.get.mockReset();
  sdk.post.mockReset();
  sdk.get.mockResolvedValue({ data: { items: [mockFunction, mockFunction2] }});
  sdk.post.mockResolvedValue({ data: { items: [mockCall] } });

  beforeEach(() => sdk.get.mockClear());
  beforeEach(() => sdk.post.mockClear());

  it('renders without crashing', () => {
    expect(() => {
      const div = document.createElement('div');
      ReactDOM.render(
        <MemoryRouter>
          <Functions />
        </MemoryRouter>,
        div
      );
      ReactDOM.unmountComponentAtNode(div);
    }).not.toThrow();
  });

  it('should load functions and calls upon mount', async () => {
    const useEffect = jest.spyOn(React, 'useEffect');
    wrap(<Functions />);

    await sleep(100);

    expect(useEffect).toHaveBeenCalled();
    expect(sdk.get).toHaveBeenCalled();
    expect(sdk.post).toHaveBeenCalled();

    expect(sdk.get).toHaveBeenCalledWith(
      '/api/playground/projects/mockProject/functions'
    );
    expect(
      sdk.post
    ).toHaveBeenCalledWith(
      '/api/playground/projects/mockProject/functions/1/calls/list',
      { data: { filter: {} } }
    );
  });

  it('should refresh functions when button is clicked', async () => {
    const wrapper = wrap(<Functions />);
    await sleep(100);

    sdk.get.mockClear();
    expect(sdk.get).not.toHaveBeenCalledWith(
      '/api/playground/projects/mockProject/functions'
    );

    await sleep(100);

    const refreshButton = wrapper.find('button.cogs-btn').at(1);
    refreshButton.simulate('click');
    expect(refreshButton).toBeDefined();

    expect(sdk.get).toHaveBeenCalledWith(
      '/api/playground/projects/mockProject/functions'
    );
  });

  it('should update functions shown if search field is filled', async () => {
    const wrapper = wrap(<Functions />);

    await sleep(100);

    const functionsDisplayed = wrapper.render().find('.ant-collapse-item');
    expect(functionsDisplayed.length).toBe(2);
    const search = wrapper.find('input[name="filter"]');
    search.simulate('change', { target: { value: 'second' } });
    const functionsDisplayedAfterSearch = wrapper
      .render()
      .find('.ant-collapse-item');
    expect(functionsDisplayedAfterSearch).toHaveLength(1);
  });

  it('search field is case insensitive', async () => {
    const wrapper = wrap(<Functions />);

    await sleep(100);

    const functionsDisplayed = wrapper.render().find('.ant-collapse-item');
    expect(functionsDisplayed.length).toBe(2);
    const search = wrapper.find('input[name="filter"]');
    search.simulate('change', { target: { value: 'SECOND' } });
    const functionsDisplayedAfterSearch = wrapper
      .render()
      .find('.ant-collapse-item');
    expect(functionsDisplayedAfterSearch).toHaveLength(1);
  });
});
