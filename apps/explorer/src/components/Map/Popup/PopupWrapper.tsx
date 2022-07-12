import React from 'react';

// import { MapContext } from '../MapProvider';

import { Content, Container } from './elements';

export const PopupWrapper: React.FC<React.PropsWithChildren<unknown>> = ({
  children,
}) => {
  // uncomment when we migrate context
  // const { model } = useContext(MapContext);
  // const cleanupFunction = () => {
  //   if (model) {
  //     model.current.removeAllStyledNodeCollections();
  //   }
  // };

  // useEffect(() => cleanupFunction, []);
  return (
    <Container>
      <Content className="z-2">{children} </Content>
    </Container>
  );
};
