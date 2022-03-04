import { screen, fireEvent } from '@testing-library/react';
import { getMockFavoriteSummary } from 'services/favorites/__fixtures/favorite';

import { testRendererModal } from '__test-utils/renderer';

import BaseFavoriteCreationModal, { Props } from './BaseFavoriteCreationModal';

const TEST_TITLE = 'test-title';
const TEST_NAME = 'test-name';
const TEST_DESCRIPTION = 'test-description';
const TEST_NAME_EDITIED = 'test-name-edited';
const TEST_DESCRIPTION_EDITIED = 'test-description-edited';
const OK_TEXT = 'OK';

describe('BaseFavoriteCreationModal', () => {
  const getDefaultProps = (): Props => ({
    isOpen: true,
    title: TEST_TITLE,
    name: '',
    description: '',
    okText: OK_TEXT,
    handleTextChanged: jest.fn(),
    handleOnConfirm: jest.fn(),
    handleOnClose: jest.fn(),
  });

  const renderModal = async (props: Props = getDefaultProps()) => ({
    ...testRendererModal(BaseFavoriteCreationModal, undefined, props),
  });

  it('should render modal as expected', async () => {
    await renderModal();

    expect(screen.getByText(TEST_TITLE)).toBeInTheDocument();
    expect(screen.getByTestId('create-favourite-name')).toHaveValue('');
    expect(screen.getByTestId('create-favourite-description')).toHaveValue('');
  });

  it('should disable only ok button initially when input fields are empty', async () => {
    await renderModal();

    expect(screen.getByText('Cancel')).toBeEnabled();
    expect(screen.getByText(OK_TEXT)).toBeDisabled();
  });

  it('should disable ok button when name is empty', async () => {
    await renderModal();
    const nameInput = screen.getByTestId('create-favourite-name');

    // Changing name
    fireEvent.change(nameInput, { target: { value: TEST_NAME } });
    expect(screen.queryByText(OK_TEXT)?.getAttribute('disabled')).toBeFalsy();

    // Deleting name
    fireEvent.change(nameInput, { target: { value: '' } });
    expect(screen.getByText(OK_TEXT)).toBeDisabled();
  });

  it('should enable ok button when changing only the name field', async () => {
    await renderModal();
    const nameInput = screen.getByTestId('create-favourite-name');
    const descriptionInput = screen.getByTestId('create-favourite-description');

    fireEvent.change(nameInput, { target: { value: TEST_NAME } });

    expect(descriptionInput).toHaveValue('');
    expect(screen.queryByText(OK_TEXT)?.getAttribute('disabled')).toBeFalsy();
  });

  it('should not enable ok button when changing only the description field', async () => {
    await renderModal();
    const nameInput = screen.getByTestId('create-favourite-name');
    const descriptionInput = screen.getByTestId('create-favourite-description');

    fireEvent.change(descriptionInput, {
      target: { value: TEST_DESCRIPTION },
    });

    expect(nameInput).toHaveValue('');
    expect(screen.getByText(OK_TEXT)).toBeDisabled();
  });

  it('should disable ok button initially when name and description is not empty', async () => {
    await renderModal({
      ...getDefaultProps(),
      item: getMockFavoriteSummary({
        name: TEST_NAME,
        description: TEST_DESCRIPTION,
      }),
      name: TEST_NAME,
      description: TEST_DESCRIPTION,
    });

    expect(screen.getByTestId('create-favourite-name')).toHaveValue(TEST_NAME);
    expect(screen.getByTestId('create-favourite-description')).toHaveValue(
      TEST_DESCRIPTION
    );
    expect(screen.getByText(OK_TEXT)).toBeDisabled();
  });

  it('should be able to edit both name and description', async () => {
    await renderModal({
      ...getDefaultProps(),
      item: getMockFavoriteSummary({
        name: TEST_NAME,
        description: TEST_DESCRIPTION,
      }),
      name: TEST_NAME,
      description: TEST_DESCRIPTION,
    });

    const nameInput = screen.getByTestId('create-favourite-name');
    const descriptionInput = screen.getByTestId('create-favourite-description');

    expect(screen.getByText(OK_TEXT)).toBeDisabled();

    fireEvent.change(nameInput, {
      target: { value: TEST_NAME_EDITIED },
    });
    fireEvent.change(descriptionInput, {
      target: { value: TEST_DESCRIPTION_EDITIED },
    });

    expect(screen.queryByText(OK_TEXT)?.getAttribute('disabled')).toBeFalsy();
  });

  it('should be able to edit only the name', async () => {
    await renderModal({
      ...getDefaultProps(),
      item: getMockFavoriteSummary({
        name: TEST_NAME,
        description: TEST_DESCRIPTION,
      }),
      name: TEST_NAME,
      description: TEST_DESCRIPTION,
    });

    const nameInput = screen.getByTestId('create-favourite-name');
    const descriptionInput = screen.getByTestId('create-favourite-description');

    expect(screen.getByText(OK_TEXT)).toBeDisabled();

    fireEvent.change(nameInput, {
      target: { value: TEST_NAME_EDITIED },
    });

    expect(descriptionInput).toHaveValue(TEST_DESCRIPTION);
    expect(screen.queryByText(OK_TEXT)?.getAttribute('disabled')).toBeFalsy();
  });

  it('should be able to edit only the description', async () => {
    await renderModal({
      ...getDefaultProps(),
      item: getMockFavoriteSummary({
        name: TEST_NAME,
        description: TEST_DESCRIPTION,
      }),
      name: TEST_NAME,
      description: TEST_DESCRIPTION,
    });

    const nameInput = screen.getByTestId('create-favourite-name');
    const descriptionInput = screen.getByTestId('create-favourite-description');

    expect(screen.getByText(OK_TEXT)).toBeDisabled();

    fireEvent.change(descriptionInput, {
      target: { value: TEST_DESCRIPTION_EDITIED },
    });

    expect(nameInput).toHaveValue(TEST_NAME);
    expect(screen.queryByText(OK_TEXT)?.getAttribute('disabled')).toBeFalsy();
  });

  it('should enable ok button when at least one input changed', async () => {
    await renderModal({
      ...getDefaultProps(),
      item: getMockFavoriteSummary({
        name: TEST_NAME,
        description: TEST_DESCRIPTION,
      }),
      name: TEST_NAME,
      description: TEST_DESCRIPTION,
    });

    const nameInput = screen.getByTestId('create-favourite-name');
    const descriptionInput = screen.getByTestId('create-favourite-description');

    expect(screen.getByText(OK_TEXT)).toBeDisabled();

    // Change name and return back to original
    fireEvent.change(nameInput, {
      target: { value: TEST_NAME_EDITIED },
    });
    expect(screen.queryByText(OK_TEXT)?.getAttribute('disabled')).toBeFalsy();
    fireEvent.change(nameInput, {
      target: { value: TEST_NAME },
    });
    expect(screen.getByText(OK_TEXT)).toBeDisabled();

    // Change description and return back to original
    fireEvent.change(nameInput, {
      target: { value: TEST_DESCRIPTION_EDITIED },
    });
    expect(screen.queryByText(OK_TEXT)?.getAttribute('disabled')).toBeFalsy();
    fireEvent.change(descriptionInput, {
      target: { value: TEST_DESCRIPTION },
    });
    expect(screen.getByText(OK_TEXT)).toBeDisabled();
  });
});
