import { usePersonSelector } from 'domain/node/internal/selectors/usePersonSelector';
import { useUserInfoQuery } from 'domain/userManagementService/internal/queries/useUserInfoQuery';

import { Avatar } from '@cognite/cogs.js';
import React from 'react';

export const AVATAR_SIZE = 40;

export const AvatarButton: React.FC = () => {
  const [name, setName] = React.useState<string>('');
  const { data, isFetched } = useUserInfoQuery();
  const existingPerson = usePersonSelector({ externalId: data?.id });

  React.useEffect(() => {
    if (isFetched) {
      if (existingPerson) {
        if (existingPerson.name) {
          setName(existingPerson.name);
        }
      } else {
        // console.log('create mode, no name yet!');
      }
    }
  }, [existingPerson, isFetched]);

  return <Avatar text={name} square size={AVATAR_SIZE} />;
};
