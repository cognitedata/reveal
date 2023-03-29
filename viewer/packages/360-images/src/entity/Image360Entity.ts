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
  private _activeRevisionId: number;
  private readonly _reloadImage: (entity: Image360Entity, revision: number) => Promise<void>;

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
    reloadImage: (entity: Image360Entity, revision: number) => Promise<void>
  ) {
    this._image360Icon = icon;
    this._reloadImage = reloadImage;
    this._activeRevisionId = 0;

    this._revisions = image360Metadata.imageRevisions.map((descriptor, revision) => {
      return new Image360RevisionEntity(imageProvider, descriptor, sceneHandler, transform, revision);
    });
  }

  /**
   * Set the opacity of all images in this entity.
   */
  public setOpacity(alpha: number): void {
    this._revisions.forEach(revision => (revision.image360Visualization.opacity = alpha));
  }

  /**
   * List the ids and dates for all available revisions. If a revison is undated, the date will be undefined.
   * @returns A list of id and date pairs, sorted with the most recent date first.
   * */
  public list360ImageRevisions(): { id: number; date?: Date }[] {
    return this._revisions.map(revision => {
      return { id: revision.revisionId, date: revision.date };
    });
  }

  /**
   * Will reload the entity with images from the new revision.
   * Resolves once loading is complete. Rejects if revision could not be changed.
   * If the entity is not entered/visible the promise will be resolved right away.
   * @returns Promise for when revision has either been updated or it failed to change.
   */
  public changeRevision(revisionId: number): Promise<void> {
    if (!this.getRevision(revisionId)) {
      return Promise.reject(Error('Invalid revision id.', { cause: 'invalid' }));
    }
    return this._reloadImage(this, revisionId);
  }

  /**
   * Get the revision that is currently loaded for this entry.
   * @returns Returns the active revision.
   */
  public getActiveRevision(): Image360RevisionEntity {
    return this.getRevision(this._activeRevisionId) ?? this.getMostRecentRevision();
  }

  /**
   * Set the revision to be loaded for this entity.
   * If there are no revisions with the provided id, the most recent revision wil be set as active.
   */
  public setActiveRevision(revision: Image360RevisionEntity): void {
    this._activeRevisionId = revision.revisionId;
  }

  public getRevision(revisionId: number): Image360RevisionEntity | undefined {
    return this._revisions.find(revision => revisionId === revision.revisionId);
  }

  /**
   * Revisions are sorted by date. Returns the first element of the array.
   */
  public getMostRecentRevision(): Image360RevisionEntity {
    return this._revisions[0];
  }

  /**
   * Get the id of the revision closest to the provided date.
   * If all revisions are undated the first available revison is returned.
   */
  public getRevisionClosestToDate(date: Date): number {
    const dateAsNumber = date.getTime();
    const closest = this._revisions.reduce(
      (closest, revision) => {
        if (revision.date) {
          const difference = Math.abs(revision.date.getTime() - dateAsNumber);
          if (difference < closest.difference) return { id: revision.revisionId, difference };
        }
        return closest;
      },
      { id: 0, difference: Number.POSITIVE_INFINITY }
    );
    return closest.id;
  }

  /**
   * @obvious
   */
  public dispose(): void {
    this._revisions.forEach(revision => revision.unload360Image());
    this._image360Icon.dispose();
  }
}
