import { Button } from '@cognite/cogs.js';
import { useTranslation } from '../hooks/useTranslation';
import { useAssets } from '../hooks/useAssets';

export const HomePage = () => {
  const { data, isLoading } = useAssets();
  const { t } = useTranslation();

  const handleLoadClick = () => {
    console.log('Handle Load click!');
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Home Page</h1>
      <Button type="primary" data-cy="load-btn" onClick={handleLoadClick}>
        {t('fancy_button', 'Fancy button')}
      </Button>
      <ul>
        {data?.items.map((asset) => (
          <li key={asset.externalId}>{asset.name}</li>
        ))}
      </ul>
    </div>
  );
};
