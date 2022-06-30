import { useProfileMutate } from 'domain/node/internal/actions/person/useProfileMutate';
import { usePersonSelector } from 'domain/node/internal/selectors/usePersonSelector';
import { useUserInfoQuery } from 'domain/userManagementService/internal/queries/useUserInfoQuery';

import * as React from 'react';
import { Button, Input, Title } from '@cognite/cogs.js';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { PAGES } from './routers/constants';

export const PageWrapper = styled.div``;
export const PageHeader = styled.div``;
export const PageContent = styled.div`
  margin: 20px 0;
`;
export const SubmitButton = styled(Button)`
  margin-top: 20px;
`;

export const ProfileContent = () => {
  const [name, setName] = React.useState<string>('');
  const updatePerson = useProfileMutate();
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

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };

  const handleSubmit = () => {
    updatePerson({ name, externalId: data?.id });
  };

  return (
    <div>
      <Input title="Name" value={name} onChange={handleChange} />
      <SubmitButton onClick={handleSubmit}>Update</SubmitButton>
    </div>
  );
};
export const Profile = () => {
  return (
    <PageWrapper>
      <PageHeader>
        <Link to={PAGES.HOME}>Back</Link>
        <Title>Profile</Title>
      </PageHeader>
      <PageContent>
        <ProfileContent />
      </PageContent>
    </PageWrapper>
  );
};
