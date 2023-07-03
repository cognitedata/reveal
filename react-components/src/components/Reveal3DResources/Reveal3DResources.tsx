/*!
 * Copyright 2023 Cognite AS
 */
import { useRef, type ReactElement, useContext } from 'react';
import { type AddModelOptions } from '@cognite/reveal';
import { type Matrix4 } from 'three';
import { CadModelContainer, Image360CollectionContainer, PointCloudContainer } from '..';
import { ModelsLoadingStateContext } from './ModelsLoadingContext';

export type AddImageCollection360Options = {
  siteId: string;
};

export type AddResourceOptions = Reveal3DModel | AddImageCollection360Options;

export type Reveal3DResourcesProps = {
  resources: AddResourceOptions[];
};

type Reveal3DModel = AddModelOptions & { type: 'cad' | 'pointcloud'; transform?: Matrix4 };

export const Reveal3DResources = ({ resources }: Reveal3DResourcesProps): ReactElement => {
  const { setModelsAdded } = useContext(ModelsLoadingStateContext);
  const numModelsLoaded = useRef(0);
  const cadModelAddOptions = resources.filter(
    (resource): resource is Reveal3DModel =>
      (resource as Reveal3DModel).type !== undefined && (resource as Reveal3DModel).type === 'cad'
  );

  const pointcloudAddOptions = resources.filter(
    (resource): resource is Reveal3DModel =>
      (resource as Reveal3DModel).type !== undefined &&
      (resource as Reveal3DModel).type === 'pointcloud'
  );

  const image360CollectionAddOptions = resources.filter(
    (resource): resource is AddImageCollection360Options =>
      (resource as AddImageCollection360Options).siteId !== undefined
  );

  const totalNumberOfModels =
    cadModelAddOptions.length + pointcloudAddOptions.length + image360CollectionAddOptions.length;

  const onModelLoaded = (): void => {
    numModelsLoaded.current += 1;
    if (numModelsLoaded.current === totalNumberOfModels) {
      setModelsAdded(true);
    }
  };

  return (
    <>
      {cadModelAddOptions.map((addModelOption) => {
        return (
          <CadModelContainer
            key={`${addModelOption.modelId}/${addModelOption.revisionId}`}
            addModelOptions={addModelOption}
            transform={addModelOption.transform}
            onLoad={onModelLoaded}
          />
        );
      })}
      {pointcloudAddOptions.map((addModelOption) => {
        return (
          <PointCloudContainer
            key={`${addModelOption.modelId}/${addModelOption.revisionId}`}
            addModelOptions={addModelOption}
            transform={addModelOption.transform}
            onLoad={onModelLoaded}
          />
        );
      })}
      {image360CollectionAddOptions.map((addModelOption) => {
        return (
          <Image360CollectionContainer
            key={`${addModelOption.siteId}`}
            siteId={addModelOption.siteId}
            onLoad={onModelLoaded}
          />
        );
      })}
    </>
  );
};
