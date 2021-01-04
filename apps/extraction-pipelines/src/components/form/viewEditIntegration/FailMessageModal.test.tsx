import React from 'react';
import { screen } from '@testing-library/react';
import { getMockResponse } from '../../../utils/mockResponse';
import { render } from '../../../utils/test';
import FailMessageModal from './FailMessageModal';

describe('FailMessageModal', () => {
  const integration = getMockResponse()[0];
  beforeEach(() => {
    jest.resetAllMocks();
    const modalRoot = document.createElement('div');
    modalRoot.setAttribute('class', 'integrations-ui-style-scope');
    document.body.appendChild(modalRoot);
  });

  test('Check header of FailMessageModal', async () => {
    const cancelMock = jest.fn();

    render(
      <FailMessageModal
        visible
        onCancel={cancelMock}
        integration={integration}
      />
    );

    const modalTitle = screen.getByText('Fail message');
    expect(modalTitle).toBeInTheDocument();

    const integrationName = screen.getByText(getMockResponse()[0].name);
    expect(integrationName).toBeInTheDocument();

    const externalId = screen.getByText(
      new RegExp(getMockResponse()[0].externalId, 'i')
    );
    expect(externalId).toBeInTheDocument();
  });
});
