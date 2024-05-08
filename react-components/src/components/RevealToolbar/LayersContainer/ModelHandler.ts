/*!
 * Copyright 2024 Cognite AS
 */
import {
  type CogniteCadModel,
  type CogniteModel,
  type CognitePointCloudModel,
  type Image360Collection
} from '@cognite/reveal';

export abstract class ModelHandler {
  protected constructor(
    protected model: CogniteModel | Image360Collection,
    public readonly name: string
  ) {}

  public abstract key(): string;
  public abstract visible(): boolean;
  public abstract setVisibility(visible: boolean): void;

  public isSame(handler: ModelHandler): boolean {
    return handler.model === this.model;
  }
}

export class CadModelHandler extends ModelHandler {
  constructor(
    private readonly _cadModel: CogniteCadModel,
    name: string | undefined
  ) {
    super(_cadModel, name ?? `cad-${_cadModel.modelId}-${_cadModel.revisionId}`);
  }

  key(): string {
    return `cad-${this._cadModel.modelId}-${this._cadModel.revisionId}`;
  }

  visible(): boolean {
    return this._cadModel.visible;
  }

  setVisibility(visible: boolean): void {
    this._cadModel.visible = visible;
  }

  getRevisionId(): number {
    return this._cadModel.revisionId;
  }
}

export class PointCloudModelHandler extends ModelHandler {
  constructor(
    private readonly _pointCloudModel: CognitePointCloudModel,
    name: string | undefined
  ) {
    super(
      _pointCloudModel,
      name ?? `pointcloud-${_pointCloudModel.modelId}-${_pointCloudModel.revisionId}`
    );
  }

  key(): string {
    return `pointcloud-${this._pointCloudModel.modelId}-${this._pointCloudModel.revisionId}`;
  }

  visible(): boolean {
    return this._pointCloudModel.visible;
  }

  setVisibility(visible: boolean): void {
    this._pointCloudModel.visible = visible;
  }

  getRevisionId(): number {
    return this._pointCloudModel.revisionId;
  }
}

export class Image360CollectionHandler extends ModelHandler {
  constructor(
    private readonly _image360Collection: Image360Collection,
    private readonly _isCurrentlyEntered: (collection: Image360Collection) => boolean,
    private readonly _exit360Image: () => void
  ) {
    super(_image360Collection, _image360Collection.id);
  }

  key(): string {
    return `image360-${this._image360Collection.id}`;
  }

  visible(): boolean {
    return this._image360Collection.getIconsVisibility();
  }

  setVisibility(visible: boolean): void {
    if (!visible && this._isCurrentlyEntered(this._image360Collection)) {
      this._exit360Image();
    }
    this._image360Collection.setIconsVisibility(visible);
  }

  getSiteId(): string {
    return this._image360Collection.id;
  }
}
