import { createStore, applyMiddleware } from 'redux';
import ReduxThunk from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';
import createRootReducer from 'reducers';

export default function configureStore(initialState = {}) {
  const middlewares = [ReduxThunk];
  const enhancers = [
    applyMiddleware(...middlewares),
    // other store enhancers if any
  ];
  const composeEnhancers = composeWithDevTools({
    // other compose enhancers if any
    // Specify here other options if needed
  });
  const store = createStore(
    createRootReducer(),
    initialState,
    composeEnhancers(...enhancers)
  );
  if ((module as any).hot) {
    // Enable Webpack hot module replacement for reducers
    (module as any).hot.accept('reducers', () => {
      /* eslint-disable global-require */
      const nextReducer = require('reducers').default;
      store.replaceReducer(nextReducer);
    });
  }

  return store;
}
