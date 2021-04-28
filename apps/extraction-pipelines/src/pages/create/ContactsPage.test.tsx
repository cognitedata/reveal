import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { QueryClient } from 'react-query';
import {
  HOURS_MAX_MSG,
  HOURS_MIN_MSG,
  HOURS_REQUIRED,
  MIN_IN_HOURS,
} from 'utils/validation/notificationValidation';
import {
  CONFIG_LABEL,
  HOURS_LABEL,
} from 'components/inputs/NotificationConfig';
import { renderRegisterContext } from 'utils/test/render';
import {
  CDF_ENV_GREENFIELD,
  ORIGIN_DEV,
  PROJECT_ITERA_INT_GREEN,
} from 'utils/baseURL';
import {
  ADD_CONTACT,
  BACK,
  EMAIL_LABEL,
  NAME_LABEL,
  NEXT,
  NOTIFICATION_LABEL,
  ROLE_LABEL,
} from 'utils/constants';
import {
  CONTACTS_PAGE_PATH,
  EXTERNAL_ID_PAGE_PATH,
} from 'routing/CreateRouteConfig';
import ContactsPage from 'pages/create/ContactsPage';
import { TableHeadings } from 'components/table/IntegrationTableCol';

describe('ContactsPage', () => {
  const props = {
    client: new QueryClient(),
    project: PROJECT_ITERA_INT_GREEN,
    cdfEnv: CDF_ENV_GREENFIELD,
    origin: ORIGIN_DEV,
    route: `/:tenant${CONTACTS_PAGE_PATH}`,
    initRegisterIntegration: {},
  };

  test('Renders', () => {
    renderRegisterContext(<ContactsPage />, { ...props });
    expect(screen.getByText(TableHeadings.CONTACTS)).toBeInTheDocument();
    expect(screen.getByText(ADD_CONTACT)).toBeInTheDocument();
  });

  test('Renders stored value', () => {
    const contact = {
      name: 'My name',
      email: 'my@name.com',
      role: 'developer',
      sendNotification: true,
    };
    const withContact = {
      ...props,
      initRegisterIntegration: { contacts: [contact] },
    };
    renderRegisterContext(<ContactsPage />, { ...withContact });
    const nameInput = screen.getByLabelText(NAME_LABEL) as HTMLInputElement;
    expect(nameInput).toBeInTheDocument();
    expect(nameInput.value).toEqual(contact.name);

    const emailInput = screen.getByLabelText(EMAIL_LABEL) as HTMLInputElement;
    expect(emailInput).toBeInTheDocument();
    expect(emailInput.value).toEqual(contact.email);

    const roleInput = screen.getByLabelText(ROLE_LABEL) as HTMLInputElement;
    expect(roleInput).toBeInTheDocument();
    expect(roleInput.value).toEqual(contact.role);

    const sendNotificationInput = screen.getByLabelText(
      NOTIFICATION_LABEL
    ) as HTMLInputElement;
    expect(sendNotificationInput).toBeInTheDocument();
    expect(sendNotificationInput.value).toEqual(`${contact.sendNotification}`);
  });

  test('Back btn path', () => {
    renderRegisterContext(<ContactsPage />, { ...props });
    const back = screen.getByText(BACK);
    const linkPath = back.getAttribute('href');
    expect(linkPath.includes(EXTERNAL_ID_PAGE_PATH)).toEqual(true);
  });

  test('Interact with skip notification', async () => {
    const NR_HOURS = 6;
    const withSkip = {
      ...props,
      initRegisterIntegration: {
        skipNotificationsInMinutes: NR_HOURS * MIN_IN_HOURS,
      },
    };
    renderRegisterContext(<ContactsPage />, { ...withSkip });
    const skipNotification = screen.getByLabelText(CONFIG_LABEL);
    expect(skipNotification).toBeChecked();
    const hours = screen.getByLabelText(HOURS_LABEL);
    expect(hours.value).toEqual(`${NR_HOURS}`);
    fireEvent.click(skipNotification);
    expect(screen.queryByLabelText(HOURS_LABEL)).not.toBeInTheDocument();
    fireEvent.click(skipNotification);
    const hours2 = screen.getByLabelText(HOURS_LABEL);
    expect(hours2).toBeInTheDocument();
    expect(hours2.value).toEqual(`${NR_HOURS}`);
    const aboveMax = 30;
    fireEvent.change(hours2, { target: { value: aboveMax } });
    expect(screen.getByDisplayValue(aboveMax)).toBeInTheDocument();
    fireEvent.click(screen.getByText(NEXT));
    await waitFor(() => {
      screen.getByText(HOURS_MAX_MSG);
    });
    expect(screen.getByText(HOURS_MAX_MSG)).toBeInTheDocument();
    const belowMin = -2;
    fireEvent.change(hours2, { target: { value: belowMin } });
    fireEvent.click(screen.getByText(NEXT));
    await waitFor(() => {
      screen.getByText(HOURS_MIN_MSG);
    });
    expect(screen.getByText(HOURS_MIN_MSG)).toBeInTheDocument();
    fireEvent.change(hours2, { target: { value: '' } });

    fireEvent.click(screen.getByText(NEXT));
    await waitFor(() => {
      screen.getByText(HOURS_REQUIRED);
    });
    expect(screen.getByText(HOURS_REQUIRED)).toBeInTheDocument();
  });
});
