import Favorites from 'images/illustrations/favorites.svg';
import Recent from 'images/illustrations/recent.svg';
import Search from 'images/illustrations/search.svg';

import { useTranslation } from 'hooks/useTranslation';

import { Img } from './elements';
import { Props } from './types';

const illustrations = {
  Search,
  Favorites,
  Recent,
};

export const Illustration: React.FC<Props> = ({ type = 'Search', alt }) => {
  const { t } = useTranslation('general');
  return (
    <Img
      src={illustrations[type]}
      alt={alt || `${t('Illustration of')} ${type.toLocaleLowerCase()}`}
      role={type.toLocaleLowerCase()}
    />
  );
};
