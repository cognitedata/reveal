import { useEffect } from 'react';

type Props = {
  title: string;
};

const PageTitle = ({ title }: Props) => {
  useEffect(() => {
    if (title) document.title = `${title} | Cognite Charts`;

    return () => {
      document.title = 'Cognite Charts';
    };
  }, [title]);
  return null;
};

export default PageTitle;
