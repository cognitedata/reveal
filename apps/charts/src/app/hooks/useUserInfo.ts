import { useQuery } from '@tanstack/react-query';
import decodeJwt, { JwtPayload } from 'jwt-decode';

import sdk, {
  getUserInformation,
  getToken,
  UserInfo,
} from '@cognite/cdf-sdk-singleton';

const COG_IDP_ISS = 'https://auth.cognite.com';

export const useUserInfo = () => {
  const { data, isLoading, isFetched } = useQuery<UserInfo | undefined>(
    ['user-info'],
    async () => {
      try {
        const token = await getToken();
        const decodedToken = decodeJwt<JwtPayload>(token);

        let azureAdOid = undefined;
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
        const userInfo = await getUserInformation();

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
