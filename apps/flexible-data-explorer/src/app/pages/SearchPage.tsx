import { Button } from '@cognite/cogs.js';
import { Page } from '../containers/page/Page';
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
            navigate.toInstancePage('Actor', 'Aamir Khan');
          }}
        >
          Amir Khan
          <Preview />
        </Button>

        <Button
          onClick={() => {
            navigate.toInstancePage('Movie', '1917');
          }}
        >
          1917
        </Button>
      </Page.Body>
    </Page>
  );
};
