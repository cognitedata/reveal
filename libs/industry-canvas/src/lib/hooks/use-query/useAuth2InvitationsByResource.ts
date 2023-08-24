import { useQuery } from '@tanstack/react-query';

import sdk from '@cognite/cdf-sdk-singleton';
import { getOrganization, getProject } from '@cognite/cdf-utilities';

import { QueryKeys, AUTH2_API_URL } from '../../constants';
import { OrganizationUserProfile } from '../../types';
import { UserProfile } from '../../UserProfileProvider';

export const getOrgUserInvitationsByResource = async ({
  resourceType = 'Canvas',
  externalId, // Id of the canvas that we want to check for invitees.
}: {
  resourceType?: string;
  externalId?: string;
}): Promise<OrganizationUserProfile[]> => {
  const organization = getOrganization();
  const project = getProject();

  const url = `${AUTH2_API_URL}/api/v0/orgs/${organization}/projects/${project}/invitations/byresource`;
  const response = await sdk.post<OrganizationUserProfile[]>(url, {
    data: JSON.stringify({
      resource: {
        kind: resourceType,
        externalId,
      },
    }),
  });

  return response.data;
};

type Props = {
  externalId?: string;
};

export const useAuth2InvitationsByResource = ({ externalId }: Props) => {
  const { data, isLoading, isError, isFetched } = useQuery(
    [QueryKeys.AUTH2_USERS_BY_RESOURCE, externalId],
    () => getOrgUserInvitationsByResource({ externalId }),
    {
      enabled: externalId !== undefined,
    }
  );

  const invitedUsers: UserProfile[] =
    data !== undefined
      ? data.map((user) => {
          return {
            userIdentifier: user.id,
            lastUpdatedTime: -1, // placeholder since it is required, new api doesn't have that info yet.
            displayName: user.name,
            email: user.email,
            pictureUrl: user.pictureUrl,
          } as UserProfile;
        })
      : [];

  return { invitationsByResource: invitedUsers, isLoading, isFetched, isError };
};
