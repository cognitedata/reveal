import { Button } from '@cognite/cogs.js';
import { Page } from '../components/page/Page';
import { Preview } from '../components/preview/Preview';
import { useNavigation } from '../hooks/useNavigation';

export const SearchPage = () => {
  const navigate = useNavigation();

  return (
    <Page>
      <Page.Body>
        <p>Actors</p>
        <Button
          onClick={() => {
            navigate.toInstancePage('deep', 'MovieDM', 'Actor', 'Aamir Khan');
          }}
        >
          Amir Khan
          <Preview />
        </Button>
      </Page.Body>
    </Page>
  );
};
