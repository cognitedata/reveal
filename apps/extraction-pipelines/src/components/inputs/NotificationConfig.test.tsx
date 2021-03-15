import { renderWithReactHookForm } from 'utils/test/render';
import {
  CONFIG_HINT,
  CONFIG_LABEL,
  HOURS_LABEL,
  NOTIFICATION_CONFIG_HEADER,
  NotificationConfig,
} from 'components/inputs/NotificationConfig';
import { QueryClient } from 'react-query';
import {
  CDF_ENV_GREENFIELD,
  ORIGIN_DEV,
  PROJECT_ITERA_INT_GREEN,
} from 'utils/baseURL';
import { CONTACTS_PAGE_PATH } from 'routing/CreateRouteConfig';
import React from 'react';
import { fireEvent, screen } from '@testing-library/react';

describe('NotificationConfig', () => {
  const props = {
    client: new QueryClient(),
    project: PROJECT_ITERA_INT_GREEN,
    cdfEnv: CDF_ENV_GREENFIELD,
    origin: ORIGIN_DEV,
    route: CONTACTS_PAGE_PATH,
    initRegisterIntegration: {},
  };
  test('Renders', () => {
    renderWithReactHookForm(<NotificationConfig />);
    expect(screen.getByText(NOTIFICATION_CONFIG_HEADER)).toBeInTheDocument();
    expect(screen.getByText(CONFIG_HINT)).toBeInTheDocument();
    expect(screen.getByText(CONFIG_LABEL)).toBeInTheDocument();
  });

  test('Interacts with component', () => {
    renderWithReactHookForm(<NotificationConfig />, { ...props });
    const checkbox = screen.getByLabelText(CONFIG_LABEL);
    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();
    const hours = screen.getByLabelText(HOURS_LABEL);
    expect(hours).toBeInTheDocument();
    const value = 4;
    fireEvent.change(hours, { target: { value } });
    expect(screen.getByDisplayValue(value)).toBeInTheDocument();
    fireEvent.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });
});
