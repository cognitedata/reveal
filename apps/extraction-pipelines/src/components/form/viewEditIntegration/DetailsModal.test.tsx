import { fireEvent, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { QueryClient } from 'react-query';
import { sdkv3 } from '@cognite/cdf-sdk-singleton';
import { act } from 'react-test-renderer';
import { getMockResponse } from '../../../utils/mockResponse';
import { render } from '../../../utils/test';
import {
  clickById,
  CONTACT_EMAIL_TEST_ID,
  CONTACT_NAME_TEST_ID,
  notExistsById,
  DETAILS_ELEMENTS,
  DETAILS_TEST_IDS,
  existsByIdAsync,
  typeInInputAsync,
  clickByIdAsync,
  existsContactAsync,
  existsByText,
  notExistsText,
  clickText,
} from '../../../utils/test/utilsFn';
import DetailsModal, {
  CLOSE_CONFIRM_CONTENT,
  UNSAVED_INFO_TEXT,
} from './DetailsModal';
import { ContactBtnTestIds } from '../ContactsView';
import {
  renderQueryCacheIntegration,
  renderWithReactQueryCacheProvider,
} from '../../../utils/test/render';
import {
  CDF_ENV_GREENFIELD,
  ORIGIN_DEV,
  PROJECT_ITERA_INT_GREEN,
} from '../../../utils/baseURL';

describe('DetailsModal', () => {
  let wrapper = null;
  let client: QueryClient;
  const integration = getMockResponse()[0];
  const integrationsResponse = getMockResponse()[1];
  beforeEach(() => {
    jest.resetAllMocks();
    client = new QueryClient();
    const cancelMock = jest.fn();
    wrapper = renderWithReactQueryCacheProvider(
      client,
      PROJECT_ITERA_INT_GREEN,
      ORIGIN_DEV,
      CDF_ENV_GREENFIELD
    );

    render(
      <DetailsModal visible onCancel={cancelMock} integration={integration} />,
      { wrapper }
    );
    sdkv3.post.mockResolvedValue({ data: { items: [integrationsResponse] } });
    sdkv3.get.mockResolvedValue({ data: { items: [integrationsResponse] } });
    const modalRoot = document.createElement('div');
    modalRoot.setAttribute('class', 'integrations-ui-style-scope');
    document.body.appendChild(modalRoot);
  });
  afterEach(() => {
    wrapper = null;
  });

  test('Unsaved changes dialog - footer', async () => {
    const row = 1;
    clickById(`${ContactBtnTestIds.EDIT_BTN}${row}`);
    typeInInputAsync(`contacts-email-${row}`, 'test@test.no');
    const bottomWarning = screen.getByText(DETAILS_ELEMENTS.UNSAVED);
    expect(bottomWarning).toBeInTheDocument();
    // click close
    clickById(DETAILS_TEST_IDS.FOOTER_CLOSE_MODAL);
    // dialog displayed
    existsByText(CLOSE_CONFIRM_CONTENT);
    // click cancel
    const cancelBtns = screen.getAllByText('Cancel');
    fireEvent.click(cancelBtns[0]);
    // dialog removed
    notExistsText(CLOSE_CONFIRM_CONTENT);
    // click close
    clickById(DETAILS_TEST_IDS.FOOTER_CLOSE_MODAL);
    // dialog displayed
    existsByText(CLOSE_CONFIRM_CONTENT);
    // click confirm
    clickText('Confirm');
    // dialog removed
    notExistsText(CLOSE_CONFIRM_CONTENT);
  });

  test('Add contact', async () => {
    const row = integration.contacts.length + 1;
    const addBtn = screen.getByText('Add');
    fireEvent.click(addBtn);
    existsByIdAsync(`${CONTACT_EMAIL_TEST_ID}${row}`);
    existsByIdAsync(`${CONTACT_NAME_TEST_ID}${row}`);
    const newName = 'Test test';
    typeInInputAsync(`${CONTACT_NAME_TEST_ID}${row}`, newName);
    const newEmail = 'test@test.no';
    typeInInputAsync(`${CONTACT_EMAIL_TEST_ID}${row}`, newEmail);
    clickByIdAsync(`${ContactBtnTestIds.CANCEL_BTN}${row}`);
    notExistsById(`${CONTACT_EMAIL_TEST_ID}${row}`);
    notExistsById(`${CONTACT_NAME_TEST_ID}${row}`);
    clickByIdAsync(`${ContactBtnTestIds.EDIT_BTN}${row}`);
    typeInInputAsync(`${CONTACT_NAME_TEST_ID}${row}`, newName);
    typeInInputAsync(`${CONTACT_EMAIL_TEST_ID}${row}`, newEmail);
    existsByText(UNSAVED_INFO_TEXT);
    clickByIdAsync(`${ContactBtnTestIds.SAVE_BTN}${row}`);
    existsContactAsync(newName, newEmail);
    notExistsText(UNSAVED_INFO_TEXT);
  });
});
describe('Updates in modal', () => {
  const integration = getMockResponse()[0];
  beforeEach(() => {
    const integrationsResponse = getMockResponse()[1];
    sdkv3.post.mockResolvedValue({ data: { items: [integrationsResponse] } });
    sdkv3.get.mockResolvedValue({ data: { items: [integrationsResponse] } });
    const cancelMock = jest.fn();
    const wrapper = renderQueryCacheIntegration(
      new QueryClient(),
      PROJECT_ITERA_INT_GREEN,
      CDF_ENV_GREENFIELD,
      ORIGIN_DEV,
      integration
    );
    act(() => {
      render(
        <DetailsModal
          visible
          onCancel={cancelMock}
          integration={integration}
        />,
        { wrapper }
      );
    });
  });

  test('Should call to get updated integration information when name is saved', async () => {
    // click first edit btn
    const editRow = 0;
    const firstEditBtn = screen.getAllByText('Edit')[editRow];
    fireEvent.click(firstEditBtn);
    const nameInput = screen.getByDisplayValue(integration.name); // assuming name is editable

    // change value in input
    const newValue = 'Something unique';
    fireEvent.change(nameInput, { target: { value: newValue } });
    fireEvent.blur(nameInput);

    // click save. new value saved. just display value
    const saveBtn = screen.getByText('Save');
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(sdkv3.post).toHaveBeenCalledTimes(1);
    });
  });

  test('Should call to get updated integration information when description is saved', async () => {
    // click first edit btn
    const editRow = 1;
    const firstEditBtn = screen.getAllByText('Edit')[editRow];
    fireEvent.click(firstEditBtn);
    const descriptionInput = screen.getByDisplayValue(integration.description);

    // change value in input
    const newValue = 'Something unique';
    fireEvent.change(descriptionInput, { target: { value: newValue } });
    fireEvent.blur(descriptionInput);

    // click save. new value saved. just display value
    const saveBtn = screen.getByText('Save');
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(sdkv3.post).toHaveBeenCalledTimes(1);
    });
  });
});
