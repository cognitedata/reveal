export {};
// import { Provider } from 'react-redux';

// import { store } from 'utils/store';

// import { Button } from '@cognite/cogs.js';

// import { showCreateFavoriteModal } from 'modules/favorite/reducer';

// import CreateFavoriteSetModal from './index';

// const withProvider = (story: any) => (
//   <Provider store={store}>{story()}</Provider>
// );

// // eslint-disable-next-line import/no-anonymous-default-export
// export default {
//   title: 'Components / Modals / create-favourite-set-modal',
//   component: CreateFavoriteSetModal,
//   decorators: [
//     withProvider,
//     (storyFn: any) => (
//       <div style={{ position: 'relative', height: 200 }}>{storyFn()}</div>
//     ),
//   ],
//   parameters: {
//     componentSubtitle: 'NB: This is a redux connected component',
//   },
// };

// export const basic = () => {
//   return (
//     <div>
//       <Button
//         onClick={() => store.dispatch<any>(showCreateFavoriteModal())}
//         aria-label="Open modal"
//       >
//         Open modal
//       </Button>
//       <CreateFavoriteSetModal />
//     </div>
//   );
// };
