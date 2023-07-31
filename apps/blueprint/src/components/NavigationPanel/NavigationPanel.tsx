import { Button, Icon } from '@cognite/cogs.js';
import { useAssetExternalIdsQuery } from 'hooks/useQuery/useAssetsQuery';
import { CogniteOrnate, OrnateExport } from 'ornate';

import * as S from './elements';

type NavigationPanelProps = {
  isInfobarActive: boolean;
  shapes: OrnateExport;
  ornateViewer: React.MutableRefObject<CogniteOrnate | undefined>;
};

export const NavigationPanel: React.FC<NavigationPanelProps> = ({
  isInfobarActive,
  shapes,
  ornateViewer,
}) => {
  const files = shapes.filter((shape) => shape.attrs?.type === 'FILE_URL');
  const allShapesWithAsset = ornateViewer.current?.stage
    .find('.drawing')
    .filter((x) => x.attrs.coreAssetExternalId);
  const { data: assets } = useAssetExternalIdsQuery(
    (allShapesWithAsset || []).map((x) => x.attrs.coreAssetExternalId)
  );
  console.log(assets);

  const getAssetFromShape = (externalId: string) => {
    return (assets || []).find((asset) => asset.externalId === externalId);
  };
  const nestedFiles = shapes
    .map((shapes) => shapes.children || [])
    .flat()
    .filter((shape) => shape.attrs?.type === 'FILE_URL');

  if ([...files, ...nestedFiles].length <= 0) {
    return (
      <S.InfoToolbarList $visible={isInfobarActive}>
        No files added
      </S.InfoToolbarList>
    );
  }
  return (
    <S.InfoToolbarList $visible={isInfobarActive}>
      <h3>Assets</h3>
      {(allShapesWithAsset || [])
        .sort((a, b) =>
          String(a.attrs.fill).localeCompare(String(b.attrs.fill))
        )
        .map((shape) => (
          <S.InfoToolbarFile
            key={shape?.attrs.id}
            onClick={() => {
              ornateViewer.current?.zoomToID(shape?.attrs.id);
            }}
          >
            <div
              style={{
                width: 16,
                height: 16,
                minWidth: 16,
                marginRight: 8,
                background: shape?.attrs.fill || 'transparent',
                display: 'inline-block',
                border: `2px solid ${shape?.attrs.stroke || 'transparent'}`,
              }}
            />
            {getAssetFromShape(shape?.attrs.coreAssetExternalId)?.name}
          </S.InfoToolbarFile>
        ))}
      <br />
      <h3>Files</h3>
      {[...files, ...nestedFiles].map((file) => (
        <S.InfoToolbarFile
          key={file.attrs.id}
          onClick={() => {
            ornateViewer.current?.zoomToID(file.attrs.id);
          }}
        >
          <Icon type="Map" /> <span>{file.attrs.fileName}</span>{' '}
          {file.attrs.locked && (
            <Button
              icon="Lock"
              size="small"
              type="ghost"
              onClick={() => {
                ornateViewer.current?.stage
                  .findOne(`#${file.attrs.id}`)
                  ?.setAttr('locked', false);
                ornateViewer.current?.emitSaveEvent();
              }}
            />
          )}
          <Button
            icon="Delete"
            className="delete-btn"
            size="small"
            type="ghost"
            onClick={() => {
              ornateViewer.current?.stage
                .findOne(`#${file.attrs.id}`)
                ?.destroy();
            }}
          />
        </S.InfoToolbarFile>
      ))}
    </S.InfoToolbarList>
  );
};
