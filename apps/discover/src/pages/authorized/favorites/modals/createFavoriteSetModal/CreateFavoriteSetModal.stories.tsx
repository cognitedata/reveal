// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck - PLEASE FIX NEXT TIME YOU CHANGE THIS FILE

import { Provider } from 'react-redux';

import { Button } from '@cognite/cogs.js';

import { store } from '_helpers/store';
import { showCreateFavoriteSetModal } from 'modules/favorite/actions';

import CreateFavoriteSetModal from './index';

const withProvider = (story: any) => (
  <Provider store={store}>{story()}</Provider>
);

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  title: 'Components / Modals / create-favourite-set-modal',
  component: CreateFavoriteSetModal,
  decorators: [
    withProvider,
    (storyFn: any) => (
      <div style={{ position: 'relative', height: 200 }}>{storyFn()}</div>
    ),
  ],
  parameters: {
    componentSubtitle: 'NB: This is a redux connected component',
  },
};

export const basic = () => {
  return (
    <div>
      <Button
        onClick={() => store.dispatch(showCreateFavoriteSetModal())}
        aria-label="Open modal"
      >
        Open modal
      </Button>
      <CreateFavoriteSetModal />
    </div>
  );
};
