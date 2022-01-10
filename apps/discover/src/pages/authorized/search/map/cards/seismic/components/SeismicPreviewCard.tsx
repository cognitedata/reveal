import React, { useEffect, useState } from 'react';

import noop from 'lodash/noop';
// import { SeismicFile } from 'modules/seismicSearch/types';
import { log } from 'utils/log';

import BasePreviewCard from 'components/card/preview-card/BasePreviewCard';
import { showErrorMessage } from 'components/toast';
import { SeismicGetData, SeismicFile } from 'modules/api/types';
import { seismicService, SeismicHeader } from 'modules/seismicSearch/service';
import { FlexGrow } from 'styles/layout';

import { Container } from '../elements';

import DatasetHeader from './DatasetHeader';
import { SeismicPreviewActions } from './SeismicPreviewActions';

interface Props {
  seismicFiles: SeismicGetData['files'];
  // seismicFiles: SeismicFile[];
}
export const SeismicPreviewCard: React.FC<Props> = ({ seismicFiles }) => {
  const [item, setItem] = useState<SeismicFile | null>(null);
  const [header, setHeader] = useState<SeismicHeader>();

  const itemIndex = seismicFiles.indexOf(item!);

  useEffect(() => {
    if (seismicFiles && seismicFiles.length > 0) {
      if (!item || !seismicFiles.includes(item)) {
        setItem(seismicFiles[0]);
      }
    } else if (item) setItem(null);

    if (item) {
      seismicService
        .getTextHeader(item.id)
        .then((result) => {
          setHeader(result);
        })
        .catch((error) => {
          log('Seismic header fetch error:', error, 3);
          showErrorMessage('Service error, please refresh the application.');
          noop();
        });
    }
  }, [seismicFiles, item]);

  const onNavigateToNext = () => {
    if (item) {
      if (seismicFiles.length > itemIndex + 1) {
        setItem(seismicFiles[itemIndex + 1]);
      }
    }
  };

  const onNavigateToPrevious = () => {
    if (item) {
      if (itemIndex - 1 >= 0) {
        setItem(seismicFiles[itemIndex - 1]);
      }
    }
  };

  if (!item) return null;

  return (
    <BasePreviewCard
      title={item?.name || 'N/A'}
      collapsible
      actions={
        <SeismicPreviewActions
          item={item}
          handleNavigateToNext={onNavigateToNext}
          handleNavigateToPrevious={onNavigateToPrevious}
        />
      }
    >
      <Container>
        <FlexGrow>
          <DatasetHeader header={header} />
        </FlexGrow>
      </Container>
    </BasePreviewCard>
  );
};

export default SeismicPreviewCard;
