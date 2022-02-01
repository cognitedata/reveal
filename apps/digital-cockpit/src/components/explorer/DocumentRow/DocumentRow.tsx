import { DocumentIcon, Tooltip } from '@cognite/cogs.js';
import { FileInfo } from '@cognite/sdk';
import { useContext, useState } from 'react';
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
        .get(`/api/v1/projects/${client.project}/files/icon?id=${document.id}`)
        .then((x) => x.data),
    {
      enabled: Boolean(document.id),
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
