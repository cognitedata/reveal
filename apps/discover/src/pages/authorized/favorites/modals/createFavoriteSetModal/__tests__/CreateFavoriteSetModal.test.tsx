import { screen, fireEvent } from '@testing-library/react';
import { Store } from 'redux';

import { testRendererModal } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';
import {
  CREATE_SET_MODAL_BUTTON_TEXT,
  CREATE_SET_MODAL_DESCRIPTION_LABEL,
  CREATE_SET_MODAL_TITLE_LABEL,
} from 'pages/authorized/favorites/constants';

import CreateFavoriteSetModal from '../CreateFavoriteSetModal';

type Props = {
  name: string;
  description: string;
};

jest.mock('@cognite/react-errors', () => ({
  reportException: jest.fn(),
}));

jest.mock('domain/favorites/internal/actions/useFavoritesMutate', () => ({
  useFavoritesCreateMutate: () => ({
    mutateAsync: (props: Props) =>
      new Promise((resolve, reject) => {
        if (props.name === 'pass') {
          resolve('pass');
        }
        reject(new Error('fail'));
      }),
  }),
  useFavoriteUpdateContent: () => ({
    mutateAsync: () =>
      new Promise((resolve) => {
        resolve('pass');
      }),
  }),
}));

describe('Create Favorite Set Model', () => {
  afterAll(jest.clearAllMocks);
  beforeEach(jest.clearAllMocks);

  const defaultTestInit = async (props: boolean) => {
    const store: Store = getMockedStore({
      favorites: {
        isCreateModalVisible: props,
        itemsToAddOnFavoriteCreation: { documentIds: [] },
      },
    });
    return testRendererModal(CreateFavoriteSetModal, store);
  };

  it('should render base favourite creation modal when `isCreateModalVisible` is true', async () => {
    await defaultTestInit(true);

    expect(screen.getByText(CREATE_SET_MODAL_TITLE_LABEL)).toBeInTheDocument();
    expect(
      screen.getByText(CREATE_SET_MODAL_DESCRIPTION_LABEL)
    ).toBeInTheDocument();
    expect(screen.getByText('Create new set')).toBeInTheDocument();
    expect(screen.getByTestId('create-favourite-name')).toBeInTheDocument();
    expect(
      screen.getByTestId('create-favourite-description')
    ).toBeInTheDocument();
  });

  it('should not render base favourite creation modal when `isCreateModalVisible` is false', async () => {
    await defaultTestInit(false);

    expect(
      screen.queryByText(CREATE_SET_MODAL_TITLE_LABEL)
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(CREATE_SET_MODAL_DESCRIPTION_LABEL)
    ).not.toBeInTheDocument();
    expect(screen.queryByText('Create new set')).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('create-favourite-name')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('create-favourite-description')
    ).not.toBeInTheDocument();
  });

  it('should render success message when provide name input and click `Create` button', async () => {
    await defaultTestInit(true);

    fireEvent.change(screen.getByTestId('create-favourite-name'), {
      target: { value: 'pass' },
    });
    fireEvent.click(screen.getByText(CREATE_SET_MODAL_BUTTON_TEXT));
    expect(await screen.findByText('Favorite set created')).toBeInTheDocument();
  });

  it('should render error message when name input is empty and click `Create` button', async () => {
    await defaultTestInit(true);

    fireEvent.change(screen.getByTestId('create-favourite-name'), {
      target: { value: 'fail' },
    });
    fireEvent.click(screen.getByText(CREATE_SET_MODAL_BUTTON_TEXT));
  });
});
