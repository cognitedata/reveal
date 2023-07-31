import { render } from 'utils/test';
import { screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import Home from './Home';

const middlewares = [thunk] as any[];
const mockStore = configureStore(middlewares);

describe('<Home />', () => {
  let store;
  test('renders No suites loaded', async () => {
    const initialState = {
      suitesTable: [],
      groups: [],
      userSpace: [],
      config: [],
    };
    store = mockStore(initialState);
    render(
      <Provider store={store}>
        <Home />
      </Provider>
    );
    expect(
      await screen.findByText(/No suites created yet!/i)
    ).toBeInTheDocument();
  });
});
