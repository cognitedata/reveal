import { Store } from 'redux';
import { getElementById } from 'utils/general.helper';

import { testRenderer } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';
import { UserAvatar } from 'components/UserAvatar/UserAvatar';

import { Props } from './UserAvatar';

describe('UserAvatar', () => {
  const page = (viewStore: Store, viewProps?: Props) =>
    testRenderer(UserAvatar, viewStore, viewProps);

  const defaultTestInit = async (props: Props) => {
    const store = getMockedStore();
    return {
      ...page(store, props),
      store,
    };
  };

  test('should render avatar component with ?', async () => {
    await defaultTestInit({});
    // get user-avatar-element
    const element = getElementById('user-avatar');
    expect(element).toBeTruthy();
    expect(element?.innerHTML).toEqual('?');
  });

  test('should render avatar with correct initials', async () => {
    await defaultTestInit({
      displayName: 'John Doe',
      email: 'john.doe@something.com',
    });
    // get user-avatar-element
    const element = getElementById('user-avatar');
    expect(element).toBeTruthy();
    expect(element?.innerHTML).toEqual('JD');
  });

  test('should render avatar with correct initials when no first name or last name provided', async () => {
    await defaultTestInit({
      email: 'john.doe@something.com',
    });
    // get user-avatar-element
    const element = getElementById('user-avatar');
    expect(element).toBeTruthy();
    expect(element?.innerHTML).toEqual('jd');
  });
});
