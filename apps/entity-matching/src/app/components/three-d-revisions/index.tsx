import { useMemo } from 'react';

import styled from 'styled-components';

import { useQuery } from '@tanstack/react-query';

import {
  Button,
  Colors,
  Flex,
  Icon,
  Illustrations,
  Title,
} from '@cognite/cogs.js';
import { Model3D } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';

import { useTranslation } from '../../common';
import { useQuickMatchContext } from '../../context/QuickMatchContext';
import { use3DRevisions } from '../../hooks/threeD';

type Props = { model: Model3D };
export default function ThreeDRevisions({ model }: Props) {
  const formatDate = useMemo(() => new Intl.DateTimeFormat().format, []);
  const { t } = useTranslation();
  const { threeDModel, setThreeDModel, setAllSources } = useQuickMatchContext();

  const { id, name } = model;
  const { data = [], isInitialLoading, error } = use3DRevisions(id);
  const fileId = data
    ?.filter((r) => !!r.thumbnailThreedFileId)
    .map((r) => r.thumbnailThreedFileId)
    .slice(-1)[0];

  if (error) {
    return <Icon type="Error" />;
  }
  if (isInitialLoading) {
    return <Icon type="Loader" />;
  }
  if (data?.length === 0) {
    return null;
  }

  return (
    <Card>
      {fileId ? <Thumbnail fileId={fileId} /> : <MissingImg />}
      <Title level={5}>{name}</Title>
      <Flex direction="column">
        {data.map((revision, i) => (
          <Button
            key={revision.id}
            type={
              model.id === threeDModel?.modelId &&
              revision.id === threeDModel?.revisionId
                ? 'primary'
                : 'ghost'
            }
            iconPlacement="right"
            icon={
              model.id === threeDModel?.modelId &&
              revision.id === threeDModel?.revisionId
                ? 'Checkmark'
                : undefined
            }
            onClick={() => {
              setAllSources(true);
              setThreeDModel({ modelId: model.id, revisionId: revision.id });
            }}
          >
            {t('revision-title', { i: i + 1 })}{' '}
            {formatDate(new Date(revision.createdTime))}
          </Button>
        ))}
      </Flex>
    </Card>
  );
}

const Thumbnail = ({ fileId }: { fileId: number }) => {
  const sdk = useSDK();
  const { data } = useQuery(
    ['3d', 'files', 'downloadUrl', fileId],
    async () => {
      const arrayBuffers = await sdk.files3D.retrieve(fileId);
      const arrayBufferView = new Uint8Array(arrayBuffers);
      const blob = new Blob([arrayBufferView]);
      return window.URL.createObjectURL(blob);
    }
  );

  if (data) {
    return <ThumbnailImg alt={`3d thumbnail ${fileId}`} src={data} />;
  }
  return <MissingImg />;
};

const Card = styled(Flex).attrs({ direction: 'column', gap: 12 })`
  border: 1px solid ${Colors['border--muted']};
  padding: 12px;
`;

const ThumbnailImg = styled.img`
  width: 100%;
`;

const MissingImg = styled(Illustrations.Solo).attrs({
  type: 'Model3d',
  prominence: 'muted',
})`
  margin: auto;
`;
