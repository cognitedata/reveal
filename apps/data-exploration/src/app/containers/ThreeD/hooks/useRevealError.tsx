import { useEffect } from 'react';

import { UseQueryResult } from '@tanstack/react-query';

import { toast } from '@cognite/cogs.js';

import RevealErrorToast from '@data-exploration-app/containers/ThreeD/RevealErrorToast';
import { useTranslation } from '@data-exploration-lib/core';

export const useRevealError = (
  result: UseQueryResult<boolean | undefined, { message: string }>[]
) => {
  const { t } = useTranslation();
  useEffect(() => {
    const errors = result
      .filter(({ isError }) => !!isError)
      .map((errorObj) => errorObj.error);

    if (errors.length) {
      errors.forEach((error) => {
        toast.error(
          <RevealErrorToast error={error as { message?: string }} t={t} />,
          {
            toastId: 'reveal-model-load-error',
          }
        );
      });
    }
  }, [result]);
};
