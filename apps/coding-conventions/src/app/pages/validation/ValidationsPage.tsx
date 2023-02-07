import { useParams } from 'react-router-dom';
import { DrawerHeader } from '../../components/Drawer';
import { dummyConventions } from '../../service/conventions';

import ValidationTextComponent from './ValidationTextComponent';
import ValidationCdfDataComponent from './ValidationCdfDataComponent';

export const ValidationsPage = () => {
  const { id } = useParams();

  const system = dummyConventions.find((item) => item.id === id);
  const title = system?.title || 'Tag';

  return (
    <>
      <DrawerHeader
        title={`Validate Coding Conventions for ${title}`}
      ></DrawerHeader>
      <ValidationTextComponent system={system!} />
      <ValidationCdfDataComponent system={system!} />
    </>
  );
};
