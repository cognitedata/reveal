import { screen, fireEvent } from '@testing-library/react';
import { Store } from 'redux';

import { testRendererModal } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';
import { SHARE_MODAL_BUTTON_TEXT } from 'pages/authorized/favorites/modals/constants';

import { BasicShareModal, Props } from '../BasicShareModal';

const onShare = jest.fn();
const onCancel = jest.fn();

const defaultProps = {
  isOpen: true,
  title: 'Test Title',
  onShare,
  onCancel,
  children: <div />,
};

describe('Basic Share modal', () => {
  const page = (viewStore: Store, props: Props) =>
    testRendererModal(BasicShareModal, viewStore, props);

  const defaultTestInit = async (props: Props) => {
    const store = getMockedStore();

    return { ...page(store, props), store };
  };

  it(`should display modal with title`, async () => {
    await defaultTestInit(defaultProps);
    const headerText = screen.getByText(defaultProps.title);
    expect(headerText).toBeInTheDocument();
  });

  it(`should trigger 'share' callback on share`, async () => {
    await defaultTestInit(defaultProps);
    const button = screen.queryByText(SHARE_MODAL_BUTTON_TEXT);
    if (button) {
      fireEvent.click(button);
    }
    expect(onShare).toBeCalledTimes(1);
  });
});
