import { InfoCell, InfoGrid, Popover } from 'components/Common';
import React from 'react';

type NoNamePreviewProps = {
  id: number;
  externalId?: string;
};
const NoNamePreview = ({ id, externalId }: NoNamePreviewProps) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <Popover
        style={{ marginRight: '6px', display: 'flex' }}
        content={
          <div>
            <InfoGrid>
              <InfoCell title="ID">{id}</InfoCell>
              <InfoCell title="External ID">
                {externalId || '<no external ID>'}
              </InfoCell>
            </InfoGrid>
          </div>
        }
      >
        <span style={{ fontStyle: 'italic' }}>{'<no name>'}</span>
      </Popover>
    </div>
  );
};

export default NoNamePreview;
