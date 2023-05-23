import { useEffect } from 'react';

const NAME = 'Cognite Data Fusion';

const PageTitle = ({ title }: { title?: string }) => {
  const pageTitle = title ? `${title} | ${NAME}` : NAME;

  useEffect(() => {
    document.title = pageTitle;
  });

  return null;
};

export default PageTitle;
