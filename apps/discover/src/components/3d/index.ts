import React from 'react';

const ThreeDee: React.LazyExoticComponent<React.FC<any>> = React.lazy(
  () => import(/* webpackChunkName: 'three-dee' */ './3d')
);

export { ThreeDee };
export default ThreeDee;
