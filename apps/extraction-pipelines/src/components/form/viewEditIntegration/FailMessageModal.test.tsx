import React from 'react';
import { screen } from '@testing-library/react';
import { QueryClient } from 'react-query';
import { getMockResponse } from '../../../utils/mockResponse';
import FailMessageModal, { NO_ERROR_MESSAGE } from './FailMessageModal';
import { renderWithSelectedIntegrationContext } from '../../../utils/test/render';

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
    renderWithSelectedIntegrationContext(
      <FailMessageModal visible onCancel={cancelMock} />,
      { initIntegration: mockIntegration, client: new QueryClient() }
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
    renderWithSelectedIntegrationContext(
      <FailMessageModal visible onCancel={cancelMock} />,
      { initIntegration: getMockResponse()[1], client: new QueryClient() }
    );
    const fallbackMessage = screen.getByText(NO_ERROR_MESSAGE);
    expect(fallbackMessage).toBeInTheDocument();
  });
});
