import React from 'react';

type Props = {
  imgUrl: string;
};
const CustomerLogo: React.FC<Props> = ({ imgUrl }) => (
  <img src={imgUrl} alt="Cognite Solutions Portal" height="48" />
);

export default React.memo(CustomerLogo);
