/*!
 * Copyright 2022 Cognite AS
 */

import { SceneHandler } from '@reveal/utilities';
import { Image360FileProvider } from '@reveal/data-providers';
import { Image360Icon } from '../icons/Image360Icon';
import { Image360 } from './Image360';
import { Historical360ImageSet } from '@reveal/data-providers/src/types';
import { Image360RevisionEntity } from './Image360RevisionEntity';

export class Image360Entity implements Image360 {
  private readonly _image360Icon: Image360Icon;
  private readonly _revisions: Image360RevisionEntity[];
  private _activeRevision: Image360RevisionEntity;
  private readonly _reloadImage: (entity: Image360Entity, revision: Image360RevisionEntity) => Promise<void>;

  /**
   * Get the icon that represents the 360
   * image during normal visualization.
   * @returns Image360Icon
   */
  get icon(): Image360Icon {
    return this._image360Icon;
  }

  constructor(
    image360Metadata: Historical360ImageSet,
    sceneHandler: SceneHandler,
    imageProvider: Image360FileProvider,
    transform: THREE.Matrix4,
    icon: Image360Icon,
    reloadImage: (entity: Image360Entity, revision: Image360RevisionEntity) => Promise<void>
  ) {
    this._image360Icon = icon;
    this._reloadImage = reloadImage;

    this._revisions = image360Metadata.imageRevisions.map(descriptor => {
      return new Image360RevisionEntity(imageProvider, descriptor, sceneHandler, transform);
    });
    this._activeRevision = this.getMostRecentRevision();
  }

  /**
   * Set the opacity of all images in this entity.
   */
  public setOpacity(alpha: number): void {
    this._revisions.forEach(revision => (revision.image360Visualization.opacity = alpha));
  }

  /**
   * List all available revisions.
   * */
  public list360ImageRevisions(): Image360RevisionEntity[] {
    return this._revisions;
  }

  /**
   * Will reload the entity with images from the new revision.
   * Resolves once loading is complete. Rejects if revision could not be changed.
   * If the entity is not entered/visible the promise will be resolved instantly.
   *
   * @param Image360Revision The revision to load
   * @returns Promise for when revision has either been updated or it failed to change.
   */
  public changeRevision(revision: Image360RevisionEntity): Promise<void> {
    return this._reloadImage(this, revision);
  }

  /**
   * Get the revision that is currently loaded for this entry.
   * @returns Returns the active revision.
   */
  public getActiveRevision(): Image360RevisionEntity {
    return this._activeRevision;
  }

  public setActiveRevision(revision: Image360RevisionEntity): void {
    this._activeRevision = revision;
  }

  public getMostRecentRevision(): Image360RevisionEntity {
    return this._revisions[0];
  }

  /**
   * Get the revision closest to the provided date.
   * If all revisions are undated the first available revison is returned.
   */
  public getRevisionClosestToDate(date: Date): Image360RevisionEntity {
    const dateAsNumber = date.getTime();
    const closest = this._revisions.reduce(
      (closest, revision) => {
        if (revision.date) {
          const difference = Math.abs(revision.date.getTime() - dateAsNumber);
          if (difference < closest.difference) return { revision: revision, difference };
        }
        return closest;
      },
      { revision: this.getMostRecentRevision(), difference: Number.POSITIVE_INFINITY }
    );
    return closest.revision;
  }

  /**
   * @obvious
   */
  public dispose(): void {
    this._revisions.forEach(revision => revision.unload360Image());
    this._image360Icon.dispose();
  }
}
