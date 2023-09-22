import { Loader, toast } from '@cognite/cogs.js';

import { useFirebaseInit } from './useFirebaseInit';

type ChartsSdkGuardProps = {
  children: React.ReactNode;
};

export const ChartsSdkInitialisationGuard: React.FC<ChartsSdkGuardProps> = ({
  children,
}) => {
  const { isFetched: firebaseDone, isError: isFirebaseError } =
    useFirebaseInit(true);

  if (!firebaseDone) {
    return <Loader />;
  }

  if (isFirebaseError) {
    toast.error('Failed to load Firebase, please reload the page', {
      autoClose: false,
      closeOnClick: false,
    });
    return <></>;
  }

  return <>{children}</>;
};
