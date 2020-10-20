import React from 'react';
import styled from 'styled-components';
import { Icons } from '@cognite/cogs.js';
import NewHeader from 'src/components/NewHeader';
import { APP_TITLE } from 'src/utils';

const NoAccessPage = (): JSX.Element => {
  return (
    <div>
      <NewHeader
        title={APP_TITLE}
        subtitle="Upload and browse 3D models"
        breadcrumbs={[{ title: APP_TITLE, path: '/3d-models' }]}
      />
      <NoAccessContent>
        <Warning>
          <Icons.Warning />
          <div>You have insufficient access rights to access this feature</div>
        </Warning>
        <Instructions>
          Check the access rights needed below and ask the person responsible
          for access management in your organization to grant them to you.
        </Instructions>
        <AccessInfoWrapper className="z-4">
          <AccessInfo>
            <p>
              It is a prerequisite to have <strong>groups:list</strong> scoped
              at least for the current user to access any feature.
            </p>
            <p>
              To browse and view 3D models, you need the capability{' '}
              <strong>3d:read</strong>.
            </p>
            <p>
              To upload a new 3D model or revision, you need the capabilities{' '}
              <strong>3d:create</strong> and <strong>files:write</strong>.
            </p>
            <p>
              To publish or unpublish a 3D model or a revision, you need the
              capability <strong>3d:update</strong>.
            </p>
            <p>
              To delete a 3D model or a revision, you need the capabilities{' '}
              <strong>3d:delete</strong> and <strong>files:write</strong>.
            </p>
          </AccessInfo>
        </AccessInfoWrapper>
      </NoAccessContent>
    </div>
  );
};

export default NoAccessPage;

const NoAccessContent = styled.div`
  margin: 80px 50px;
`;

const Warning = styled.div`
  font-size: 16px;
  color: var(--cogs-yellow-1);
  font-weight: bold;
  margin-bottom: 14px;
  display: flex;
  align-items: center;
  svg {
    margin-right: 1em;
  }
`;

const Instructions = styled.div`
  margin-bottom: 28px;
`;

const AccessInfoWrapper = styled.div`
  background-color: white;
  padding: 14px;
  margin: 14px;
  border-radius: 4px;
`;

const AccessInfo = styled.div`
  color: var(--cogs-text-color);
  padding: 7px 14px;
  width: 100%;
  p:last-child {
    margin-bottom: 0;
  }
  strong {
    font-weight: bold;
  }
`;
