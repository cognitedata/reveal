import React from 'react';
import ReactDOM from 'react-dom';

import { MemoryRouter } from 'react-router';
import { mount } from 'enzyme';

import TestWrapper from 'utils/TestWrapper';
import sdk from 'sdk-singleton';
import { sleep } from 'helpers';
import FunctionLogsModal from './FunctionLogsModal';
import { setConsole } from 'react-query';

const wrap = (node: React.ReactNode) =>
  mount(<TestWrapper>{node}</TestWrapper>);

sdk.get.mockResolvedValue({});
sdk.post.mockResolvedValue({});

describe('FunctionLogsModal', () => {
  it('renders without crashing', () => {
    expect(() => {
      const div = document.createElement('div');
      ReactDOM.render(
        <MemoryRouter>
          <FunctionLogsModal onCancel={jest.fn()} id={1} callId={2} />
        </MemoryRouter>,
        div
      );
      ReactDOM.unmountComponentAtNode(div);
    }).not.toThrow();
  });

  it('displays a normal title', () => {
    const wrapper = wrap(
      <FunctionLogsModal onCancel={jest.fn()} id={1} callId={2} />
    );
    const title = wrapper.find('.ant-modal-title');
    expect(title.text()).toBe('Logs');
  });

  it('downloads and displays logs', async () => {
    sdk.get.mockReset();

    sdk.get.mockResolvedValueOnce({
      data: {
        items: [
          { message: 'Fetching all assets ...', timestamp: 1601310912576 },
          {
            message: 'Found 285337 assets in 44.29713797569275 seconds',
            timestamp: 1601310956873,
          },
        ],
      },
    });

    sdk.get.mockResolvedValueOnce({
      data: {
        endTime: 1601125177860,
        functionId: 1967465730947121,
        id: 1295178090629763,
        startTime: 1601125132796,
        status: 'Failed',
      },
    });

    const wrapper = wrap(
      <FunctionLogsModal onCancel={jest.fn()} id={1} callId={2} />
    );

    await sleep(100);
    expect(sdk.get).toHaveBeenNthCalledWith(
      1,
      '/api/playground/projects/mockProject/functions/1/calls/2/logs'
    );

    expect(sdk.get).toHaveBeenNthCalledWith(
      2,
      '/api/playground/projects/mockProject/functions/1/calls/2'
    );

    const result = wrapper.find('.ant-modal-content');
    expect(result.text()).toBeTruthy();
    expect(result.text()).toContain(
      'Found 285337 assets in 44.29713797569275 seconds'
    );
  });

  it('displays text if error is set', async () => {
    setConsole({
      log: () => {},
      warn: () => {},
      error: () => {},
    });

    sdk.get.mockReset();
    sdk.get.mockRejectedValue('log error');
    const wrapper = wrap(
      <FunctionLogsModal onCancel={jest.fn()} id={1} callId={2} />
    );
    await sleep(100);
    const alert = wrapper.render().find('.ant-alert-error');
    expect(alert).toBeDefined();
    expect(alert.text()).toContain('log error');
  });

  it('should call onCancel when button is clicked', () => {
    const cancelFunc = jest.fn();
    const wrapper = wrap(
      <FunctionLogsModal
        onCancel={cancelFunc}
        id={1}
        callId={2}
      />
    );

    const b = wrapper.find('button.ant-modal-close');
    b.simulate('click');
    expect(cancelFunc).toBeCalledTimes(1);
  });
});
