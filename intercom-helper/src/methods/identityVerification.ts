import getHmac from '../utils/getHmac';
import { IdentityVerificationSettings } from '../types';

type Response = {
  success: boolean;
  error?: Error;
};

export default (settings: IdentityVerificationSettings): Promise<Response> => {
  return getHmac(settings.appsApiUrl, settings.headers)
    .then(
      (obj): Response => {
        window.Intercom('update', {
          user_id: obj.userUid,
          user_hash: obj.hmac,
        });
        return { success: true };
      }
    )
    .catch(
      (error): Response => {
        return {
          success: false,
          error,
        };
      }
    );
};
