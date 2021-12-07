import { useHistory } from 'react-router-dom';
import { Icon } from '@cognite/cogs.js';

import { GoBackContainer } from './elements';

export interface BackButtonProps {
  URL: string;
}

export default function GoBackButton({ URL }: BackButtonProps) {
  const history = useHistory();

  const goBack = () => history.push(URL);

  return (
    <GoBackContainer>
      <Icon
        type="ArrowLeft"
        size={30}
        style={{ cursor: 'pointer' }}
        onClick={goBack}
      />
    </GoBackContainer>
  );
}
