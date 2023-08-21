import { useMutation, useQueryClient } from '@tanstack/react-query';

import { getToken } from '@cognite/cdf-sdk-singleton';
import { getOrganization, getProject } from '@cognite/cdf-utilities';
import { toast } from '@cognite/cogs.js';

import { QueryKeys, TOAST_POSITION, AUTH2_API_URL } from '../../constants';

export const getOrgUserRevokeInvitations = async ({
  resourceType = 'Canvas',
  externalId, // Id of the canvas that we want to invite users
  userIdsToUninvite,
}: {
  resourceType?: string;
  externalId?: string;
  userIdsToUninvite?: string[];
}): Promise<{}> => {
  const organization = getOrganization();
  const project = getProject();

  const url = `${AUTH2_API_URL}/api/v0/orgs/${organization}/projects/${project}/invitations/delete`;
  const token = await getToken();

  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify({
      resource: {
        kind: resourceType,
        externalId,
      },
      usersToUninvite: userIdsToUninvite?.map((userId) => ({
        id: userId,
      })),
    }),
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${token}`,
    },
  }).then((r) => r.json());

  return response;
};

type Props = {
  externalId?: string;
  userIdsToUninvite?: string[];
};

export const useAuth2RevokeInvitationsMutation = ({
  externalId,
}: {
  externalId?: string;
}) => {
  const queryClient = useQueryClient();

  return useMutation(
    [QueryKeys.AUTH2_REVOKE_INVITATIONS, externalId], //?
    async ({ externalId, userIdsToUninvite }: Props) =>
      getOrgUserRevokeInvitations({ externalId, userIdsToUninvite }),
    {
      onMutate: (data) => {
        return { externalId: data.externalId };
      },
      onSuccess: (data, variables) => {
        toast.success('User(s) are successfully uninvited', {
          toastId: 'industry-canvas-revoke-invitation-success',
          position: TOAST_POSITION,
        });

        return queryClient.invalidateQueries({
          queryKey: [QueryKeys.AUTH2_USERS_BY_RESOURCE, variables.externalId],
        });
      },
    }
  );
};
