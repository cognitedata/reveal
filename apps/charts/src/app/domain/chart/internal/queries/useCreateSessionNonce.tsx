import { useMutation } from 'react-query';
import { useSDK } from '@cognite/sdk-provider';
import { SessionAPIPayload } from '../types';
import { getCapabilities } from '../../service/network/getCapabilities';
import { createSession } from '../network/createSession';

/**
 * Create Session Nonce
 * ===================================
 *
 * This method creates a nOnce using the sessions API
 *
 * -----------------------------------------------------------------------------
 * Properties
 * -----------------------------------------------------------------------------
 * @returns UseMutationResult                             - Returns UseMutationResult
 * @returns
 */

export const useCreateSessionNonce = () => {
  const sdk = useSDK();
  return useMutation(
    async (payload: SessionAPIPayload) => {
      await getCapabilities(sdk);

      return createSession(payload, sdk).then(({ data }) => data);
    },
    {
      onSuccess: () => {},
    }
  );
};
