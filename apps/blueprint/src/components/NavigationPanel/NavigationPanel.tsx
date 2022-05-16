import { Button, Icon } from '@cognite/cogs.js';
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
