import { useEffect, useState } from 'react';
import { useAuthContext } from '@cognite/react-container';
import { FileInfo } from '@cognite/sdk';
import { DIAGRAM_PARSER_SOURCE } from '@cognite/pid-tools';

const useCdfDiagrams = () => {
  const { client } = useAuthContext();
  const [diagrams, setDiagrams] = useState<FileInfo[]>([]);

  useEffect(() => {
    client?.files
      .list({
        filter: { mimeType: 'image/svg+xml', source: DIAGRAM_PARSER_SOURCE },
      })
      .then((response) => {
        setDiagrams(response.items);
      });
  }, []);

  return diagrams;
};

export default useCdfDiagrams;
