import { fireEvent, screen } from '@testing-library/react';
import React from 'react';
import { QueryCache } from 'react-query';
import { sdkv3 } from '@cognite/cdf-sdk-singleton';
import { getMockResponse } from '../../utils/mockResponse';
import {
  CDF_ENV_GREENFIELD,
  ORIGIN_DEV,
  PROJECT_ITERA_INT_GREEN,
  renderQueryCacheIntegration,
} from '../../utils/test/render';
import { render } from '../../utils/test';
import DescriptionView from './DescriptionView';
import { DetailFieldNames, Integration } from '../../model/Integration';

describe('<DescriptionView />', () => {
  test('Should render and interact with description field', async () => {
    sdkv3.post.mockResolvedValue({ data: { items: [getMockResponse()[0]] } });
    const integration = getMockResponse()[0];
    const queryCache = new QueryCache();
    const wrapper = renderQueryCacheIntegration(
      queryCache,
      PROJECT_ITERA_INT_GREEN,
      CDF_ENV_GREENFIELD,
      ORIGIN_DEV,
      integration
    );
    render(<DescriptionView />, { wrapper });
    expect(screen.getByText(DetailFieldNames.DESCRIPTION)).toBeInTheDocument();
    expect(screen.queryByText(integration.description)).toBeInTheDocument();
    const editBtn = screen.getByText('Edit');
    fireEvent.click(editBtn);
    const textArea = screen.getByDisplayValue(integration.description);
    expect(textArea).toBeInTheDocument();
    const newDescription = 'This is new';
    fireEvent.change(textArea, { target: { value: newDescription } });
    fireEvent.blur(textArea);
    expect(screen.getByTestId('warning-icon-description')).toBeInTheDocument();
    const saveBtn = screen.getByText('Save');
    expect(saveBtn).toBeInTheDocument();
    fireEvent.click(saveBtn);
    expect(await screen.findByText(newDescription)).toBeInTheDocument();
  });

  test('Should render when description is undefined', () => {
    const integration = {
      ...getMockResponse()[0],
      description: undefined,
    } as Integration;

    const queryCache = new QueryCache();
    const wrapper = renderQueryCacheIntegration(
      queryCache,
      PROJECT_ITERA_INT_GREEN,
      CDF_ENV_GREENFIELD,
      ORIGIN_DEV,
      integration
    );
    render(<DescriptionView />, { wrapper });
    expect(screen.getByText(DetailFieldNames.DESCRIPTION)).toBeInTheDocument();
    expect(
      screen.queryByTestId('integration-description')?.textContent
    ).toEqual('');
  });

  test('Should render when there is no description field', () => {
    const integration = { name: 'This is the name' } as Integration;

    const queryCache = new QueryCache();
    const wrapper = renderQueryCacheIntegration(
      queryCache,
      PROJECT_ITERA_INT_GREEN,
      CDF_ENV_GREENFIELD,
      ORIGIN_DEV,
      integration
    );
    render(<DescriptionView />, { wrapper });
    expect(screen.getByText(DetailFieldNames.DESCRIPTION)).toBeInTheDocument();
    expect(
      screen.queryByTestId('integration-description')?.textContent
    ).toEqual('');
  });
});
