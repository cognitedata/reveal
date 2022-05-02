import EntityFeedback from 'components/Modals/entity-feedback';
import { CreateFavoriteSetModal } from 'pages/authorized/favorites/modals';

export const GlobalModals = () => {
  return (
    <>
      <EntityFeedback />
      <CreateFavoriteSetModal />
    </>
  );
};
