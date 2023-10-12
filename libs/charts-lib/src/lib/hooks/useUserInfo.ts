import { useQuery } from '@tanstack/react-query';
import decodeJwt, { JwtPayload } from 'jwt-decode';

import sdk, { getUserInformation, getToken } from '@cognite/cdf-sdk-singleton';

const COG_IDP_ISS = 'https://auth.cognite.com';

// We needed to add this type here since it was not importable directly from
// shared lib '@cognite/cdf-sdk-singleton'.
type UserInfo = {
  displayName?: string;
  givenName?: string;
  id: string;
  mail?: string;
  userPrincipalName?: string;
  profilePicture?: string; // if defined, then a URL to the picture
};

// This hook is copied here from 'charts' app to be used for apiHooks - to fetch user's charts.
export const useUserInfo = () => {
  const { data, isLoading, isFetched } = useQuery<UserInfo | undefined>(
    ['use-user-info-from-charts-lib'],
    async () => {
      try {
        const token = await getToken();
        const decodedToken = decodeJwt<JwtPayload>(token);
        const userInfo = await getUserInformation();

        let azureAdOid: string | undefined = undefined;
        if (decodedToken.iss === COG_IDP_ISS) {
          azureAdOid = await sdk
            .get<{ azureAdOid: string }>(
              `${COG_IDP_ISS}/api/v0/users/me/temp-extra-data`,
              {
                withCredentials: true,
              }
            )
            .then((res) => res.data.azureAdOid);
        }

        /**
         * If the user logged in with Cognite IDP, we need older azureAdOid
         * to be able to fetch existing charts for the user as that charts match using userId.
         *
         * We need a migration plan in place for us to move to new uniqueUserId provided by Cognite idp
         */
        return {
          ...userInfo,
          id: azureAdOid || userInfo.id,
        };
      } catch (e) {
        return undefined;
      }
    }
  );

  return { data, isLoading, isFetched };
};
