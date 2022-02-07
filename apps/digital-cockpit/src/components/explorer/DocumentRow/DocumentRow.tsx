import { Buffer } from 'buffer';

import { useContext, useState } from 'react';
import { DocumentIcon, Tooltip } from '@cognite/cogs.js';
import { FileInfo } from '@cognite/sdk';
import { useQuery } from 'react-query';
import { CogniteSDKContext } from 'providers/CogniteSDKProvider';

import { DocumentRowWrapper } from './elements';

export type DocumentRowProps = {
  document: FileInfo;
  descriptionField?: string;
  onClick?: () => void;
};

const DocumentRow = ({
  document,
  descriptionField,
  onClick,
}: DocumentRowProps) => {
  const { client } = useContext(CogniteSDKContext);
  const [isBroken, setBroken] = useState(false);
  const { data: image } = useQuery<any>(
    ['getFileImage', document.id],
    () =>
      client
        .get(
          `/api/playground/projects/${client.project}/documents/preview?documentId=${document.id}`,
          { headers: { Accept: 'image/png' }, responseType: 'arraybuffer' }
        )
        .then((response) => {
          return `data:image/png;base64,${Buffer.from(response.data).toString(
            'base64'
          )}`;
        }),
    {
      enabled: Boolean(document.id),
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
    }
  );

  const renderImage = () => {
    if (image && !isBroken) {
      return (
        <Tooltip
          content={
            <img src={image} alt={document.name} style={{ width: 320 }} />
          }
        >
          <img
            src={image}
            alt={document.name}
            onError={() => setBroken(true)}
          />
        </Tooltip>
      );
    }
    return <DocumentIcon file={document.name} />;
  };

  return (
    <DocumentRowWrapper onClick={onClick} className="row">
      <section className="document-row--image">{renderImage()}</section>
      <section className="document-row--meta">
        <h4>{document.name}</h4>
        <div>{document.metadata?.[descriptionField || '']}</div>
      </section>
    </DocumentRowWrapper>
  );
};

export default DocumentRow;
