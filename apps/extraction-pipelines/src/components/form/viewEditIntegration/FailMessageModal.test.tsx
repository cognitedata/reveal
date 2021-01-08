import React from 'react';
import { screen } from '@testing-library/react';
import { getMockResponse } from '../../../utils/mockResponse';
import { render } from '../../../utils/test';
import FailMessageModal, { NO_ERROR_MESSAGE } from './FailMessageModal';

describe('FailMessageModal', () => {
  const mockIntegration = getMockResponse()[0];
  const cancelMock = jest.fn();
  beforeEach(() => {
    jest.resetAllMocks();
    const modalRoot = document.createElement('div');
    modalRoot.setAttribute('class', 'integrations-ui-style-scope');
    document.body.appendChild(modalRoot);
  });

  test('Check header of FailMessageModal', async () => {
    render(
      <FailMessageModal
        visible
        onCancel={cancelMock}
        integration={mockIntegration}
      />
    );

    const modalTitle = screen.getByText('Fail message');
    expect(modalTitle).toBeInTheDocument();

    const integrationName = screen.getByText(mockIntegration.name);
    expect(integrationName).toBeInTheDocument();

    const externalId = screen.getByText(
      new RegExp(mockIntegration.externalId, 'i')
    );
    expect(externalId).toBeInTheDocument();

    const failedRunErrorMessage = screen.getByText(
      new RegExp(mockIntegration.lastMessage, 'i')
    );
    expect(failedRunErrorMessage).toBeInTheDocument();
  });

  test('Display fallback message if not message is set', async () => {
    render(
      <FailMessageModal
        visible
        onCancel={cancelMock}
        integration={getMockResponse()[1]}
      />
    );
    const fallbackMessage = screen.getByText(NO_ERROR_MESSAGE);
    expect(fallbackMessage).toBeInTheDocument();
  });
});
