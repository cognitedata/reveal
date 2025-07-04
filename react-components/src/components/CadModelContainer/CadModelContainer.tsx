import { type ReactElement, useEffect, useState, useRef, useContext } from 'react';
import type {
  GeometryFilter,
  AddModelOptions,
  CogniteCadModel,
  ClassicDataSourceType
} from '@cognite/reveal';
import type { Matrix4 } from 'three';
import { isEqual } from 'lodash';
import { modelExists } from '../../utilities/modelExists';
import { getViewerResourceCount } from '../../utilities/getViewerResourceCount';
import type { CadModelStyling } from './types';
import { isSameGeometryFilter, isSameModel } from '../../utilities/isSameModel';
import { CadModelContext } from './CadModelContainer.context';

export type CogniteCadModelProps = {
  addModelOptions: AddModelOptions<ClassicDataSourceType>;
  styling?: CadModelStyling;
  transform?: Matrix4;
  onLoad?: (model: CogniteCadModel) => void;
  onLoadError?: (options: AddModelOptions<ClassicDataSourceType>, error: any) => void;
};

export function CadModelContainer({
  addModelOptions,
  transform,
  styling,
  onLoad,
  onLoadError
}: CogniteCadModelProps): ReactElement {
  const {
    useRenderTarget,
    useReveal3DResourceLoadFailCount,
    useReveal3DResourcesCount,
    useRevealKeepAlive,
    useApplyCadModelStyling,
    createCadDomainObject,
    removeCadDomainObject
  } = useContext(CadModelContext);

  const cachedViewerRef = useRevealKeepAlive();
  const renderTarget = useRenderTarget();
  const viewer = renderTarget.viewer;
  const { setRevealResourcesCount } = useReveal3DResourcesCount();
  const { setReveal3DResourceLoadFailCount } = useReveal3DResourceLoadFailCount();
  const initializingModel = useRef<AddModelOptions<ClassicDataSourceType> | undefined>(undefined);
  const initializingModelsGeometryFilter = useRef<GeometryFilter | undefined>(undefined);

  const [model, setModel] = useState<CogniteCadModel | undefined>(undefined);

  const { modelId, revisionId, geometryFilter } = addModelOptions;

  useEffect(() => {
    if (isEqual(initializingModel.current, addModelOptions) || addModelOptions === undefined) {
      return;
    }

    initializingModel.current = addModelOptions;
    const cleanupCallbackPromise = addModel(addModelOptions, transform)
      .then((model) => {
        onLoad?.(model);
        setRevealResourcesCount(getViewerResourceCount(viewer));
        return () => {
          removeModel(model);
        };
      })
      .catch((error) => {
        const errorReportFunction = onLoadError ?? defaultLoadErrorHandler;
        errorReportFunction(addModelOptions, error);
        setReveal3DResourceLoadFailCount((p) => p + 1);
        return () => {
          setReveal3DResourceLoadFailCount((p) => p - 1);
        };
      });

    return () => {
      void cleanupCallbackPromise.then((callback) => {
        callback();
      });
    };
  }, [modelId, revisionId, geometryFilter]);

  useEffect(() => {
    if (!modelExists(model, viewer) || transform === undefined) return;

    model.setModelTransformation(transform);
  }, [transform, model]);

  useApplyCadModelStyling(model, styling);

  return <></>;

  async function addModel(
    addModelOptions: AddModelOptions,
    transform?: Matrix4
  ): Promise<CogniteCadModel> {
    const cadModel = await getOrAddModel();

    if (transform !== undefined) {
      cadModel.setModelTransformation(transform);
    }
    setModel(cadModel);

    return cadModel;

    async function getOrAddModel(): Promise<CogniteCadModel> {
      const viewerModel = viewer.models.find((model) => {
        const cadModel = { ...model, transform: model.getModelTransformation() };
        return (
          isSameModel(cadModel, addModelOptions) &&
          isSameGeometryFilter(geometryFilter, initializingModelsGeometryFilter.current)
        );
      });
      if (viewerModel !== undefined) {
        return await Promise.resolve(viewerModel as CogniteCadModel);
      }
      initializingModelsGeometryFilter.current = geometryFilter;
      return await createCadDomainObject(renderTarget, addModelOptions);
    }
  }

  function removeModel(model: CogniteCadModel): void {
    if (!modelExists(model, viewer)) return;

    if (cachedViewerRef !== undefined && !cachedViewerRef.isRevealContainerMountedRef.current)
      return;

    removeCadDomainObject(renderTarget, model);
    setRevealResourcesCount(getViewerResourceCount(viewer));
  }
}

function defaultLoadErrorHandler(addOptions: AddModelOptions, error: any): void {
  console.warn(
    `Failed to load (${addOptions.modelId}, ${addOptions.revisionId}): ${JSON.stringify(error)}`
  );
}
