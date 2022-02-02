import { CogniteOrnate, DefaultTool, OrnateTransformer } from '@cognite/ornate';
import { CogniteClient } from '@cognite/sdk';
import OrnateTimeSeriesTag from 'components/TimeseriesTag/OrnateTimeSeriesTag';
import { MutableRefObject, useEffect, useRef, useState } from 'react';
import { BlueprintDefinition, TimeSeriesTag } from 'typings';

import { BlueprintWrapper } from './elements';

export type BlueprintProps = {
  client: CogniteClient;
  blueprint?: BlueprintDefinition;
  onUpdate?: (nextBlueprint: BlueprintDefinition) => void;
  onSelectTag?: (nextTagId: string) => void;
  onDeleteTag?: (tag: TimeSeriesTag) => void;
  onReady?: (viewer: MutableRefObject<CogniteOrnate | undefined>) => void;
  isAllMinimized?: boolean;
};

const Blueprint = ({
  client,
  blueprint,
  onUpdate,
  onSelectTag,
  onDeleteTag,
  onReady,
  isAllMinimized,
}: BlueprintProps) => {
  const ornateViewer = useRef<CogniteOrnate>();
  const [isReady, setIsReady] = useState(false);
  const [loadedBlueprint, setLoadedBlueprint] = useState<BlueprintDefinition>();

  useEffect(() => {
    ornateViewer.current = new CogniteOrnate({
      container: '#ornate-container',
    });

    const ornateTransformer = new OrnateTransformer(ornateViewer.current);
    ornateViewer.current.transformer = ornateTransformer;
    ornateViewer.current.baseLayer.add(ornateViewer.current.transformer);

    ornateViewer.current.tools = {
      default: new DefaultTool(ornateViewer.current),
    };
    ornateViewer.current.currentTool = ornateViewer.current.tools.default;

    setIsReady(true);
    if (onReady) {
      onReady(ornateViewer);
    }
  }, []);

  useEffect(() => {
    if (blueprint && loadedBlueprint?.id !== blueprint.id) {
      setLoadedBlueprint(blueprint);
    }
  }, [blueprint, loadedBlueprint]);

  return (
    <BlueprintWrapper>
      <div id="ornate-container" />
      <div id="ornate-toolbar" />

      {isReady &&
        blueprint?.timeSeriesTags.map((tag) => (
          <OrnateTimeSeriesTag
            key={tag.id}
            timeSeriesTag={tag}
            ornateViewer={ornateViewer}
            client={client}
            onChangeSettings={() => onSelectTag && onSelectTag(tag.id)}
            onDelete={() => onDeleteTag && onDeleteTag(tag)}
            isMinimized={isAllMinimized}
            onUpdate={(nextTag) => {
              if (onUpdate) {
                const nextBlueprint: BlueprintDefinition = {
                  ...blueprint,
                  timeSeriesTags: blueprint.timeSeriesTags.map((t) => {
                    if (t.id === tag.id) {
                      return nextTag;
                    }
                    return t;
                  }),
                };

                onUpdate(nextBlueprint);
              }
            }}
          />
        ))}
    </BlueprintWrapper>
  );
};

export default Blueprint;
