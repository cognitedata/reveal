import EntityFeedback from 'components/modals/entity-feedback';
import { CreateFavoriteSetModal } from 'pages/authorized/favorites/modals';

export const GlobalModals = () => {
  return (
    <>
      <EntityFeedback />
      <CreateFavoriteSetModal />
    </>
  );
};
