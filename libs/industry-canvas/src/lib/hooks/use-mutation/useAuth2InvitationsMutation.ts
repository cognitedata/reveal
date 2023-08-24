import { useMutation, useQueryClient } from '@tanstack/react-query';

import sdk from '@cognite/cdf-sdk-singleton';
import { getOrganization } from '@cognite/cdf-utilities';
import { toast } from '@cognite/cogs.js';

import { QueryKeys, TOAST_POSITION, AUTH2_API_URL } from '../../constants';

type Organisation = { id: string };

export const getOrgUserInvitations = async ({
  resourceType = 'Canvas',
  externalId, // Id of the canvas that we want to invite users
  title,
  canvasUrl,
  userIdsToInvite,
  sendEmail = false, // default => do not send invite emails
}: {
  resourceType?: string;
  externalId?: string;
  title?: string;
  canvasUrl?: string;
  userIdsToInvite?: string[];
  sendEmail?: boolean;
}) => {
  const organization = getOrganization();
  const url = `${AUTH2_API_URL}/api/v0/orgs/${organization}/projects/${sdk.project}/invitations`;

  const response = await sdk.post<Organisation[]>(url, {
    data: JSON.stringify({
      resource: {
        kind: resourceType,
        externalId,
        title,
        url: canvasUrl,
      },
      usersToInvite: userIdsToInvite?.map((userId) => ({
        id: userId,
      })),
      sendEmail,
    }),
  });

  return response.data;
};

type Props = {
  externalId?: string;
  title?: string;
  canvasUrl?: string;
  userIdsToInvite?: string[];
  sendEmail?: boolean;
};

export const useAuth2InvitationsMutation = ({
  externalId,
}: {
  externalId?: string;
}) => {
  const queryClient = useQueryClient();

  return useMutation(
    [QueryKeys.AUTH2_INVITATIONS, externalId], //?
    async ({
      externalId,
      title,
      canvasUrl,
      userIdsToInvite,
      sendEmail,
    }: Props) =>
      getOrgUserInvitations({
        externalId,
        title,
        canvasUrl,
        userIdsToInvite,
        sendEmail,
      }),
    {
      onMutate: (data) => {
        return { externalId: data.externalId };
      },
      onSuccess: (data, variables) => {
        toast.success('User(s) are successfully invited', {
          toastId: 'industry-canvas-invitation-success',
          position: TOAST_POSITION,
        });

        return queryClient.invalidateQueries({
          queryKey: [QueryKeys.AUTH2_USERS_BY_RESOURCE, variables.externalId],
        });
      },
    }
  );
};
