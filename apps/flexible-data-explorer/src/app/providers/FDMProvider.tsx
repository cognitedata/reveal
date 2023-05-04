import { createContext, useContext } from 'react';
import type { FC, PropsWithChildren } from 'react';
import { useParams } from 'react-router-dom';
// import { useSDK } from '@cognite/sdk-provider';

const FDMContext = createContext<any>(undefined);

export const FDMProvider: FC<PropsWithChildren> = ({ children }) => {
  // const { client: cogniteClient } = useAuthContext();
  // const sdk = useSDK();

  // const fdmClient = useMemo(
  //   () =>
  //     new FDMClient(sdk, {

  //     }),
  //   [sdk]
  // );

  const { space, dataModel, version } = useParams();
  console.log('triggered', space, dataModel, version);

  // const isCollectionSelected = space && dataModel && version;

  // if (!isCollectionSelected) {
  //   return <Navigate to="deep/movie/latest" />;
  //   // return <p>SELECT SPACE</p>;
  // }

  return (
    // <FDMContext.Provider value={fdmClient}>{children}</FDMContext.Provider>
    <>{children}</>
  );
};

export const useFDMServices = () => {
  const context = useContext(FDMContext);
  if (!context) {
    throw new Error(
      'useFDMServices must be used within an instance of FDMServicesProvider'
    );
  }
  return context;
};
