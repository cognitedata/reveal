import React from 'react';
import { Helmet } from 'react-helmet';
import { getSidecar } from 'utils';

const TitleChanger = () => {
  const { appName } = getSidecar();
  return (
    <Helmet>
      <title>{appName}</title>
    </Helmet>
  );
};

export default TitleChanger;
