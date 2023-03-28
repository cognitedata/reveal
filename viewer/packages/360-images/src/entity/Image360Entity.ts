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
    icon: Image360Icon
  ) {
    this._image360Icon = icon;
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
   * Get the revision that is currently loaded for this entry.
   * @returns Returns the active revision.
   */
  public getActiveRevision(): Image360RevisionEntity {
    return this.getRevision(this._activeRevisionId);
  }

  /**
   * Set the revision to be loaded for this entity.
   * If there are no revisions with the provided id, the most recent revision wil be set as active.
   */
  public setActiveRevision(revisionId: number): Image360RevisionEntity {
    const revision = this.getRevision(revisionId);
    this._activeRevisionId = revision.revisionId;
    return revision;
  }

  /**
   * Returns the revision with the provided id.
   * If there are no revisions with this id, the most recent revision will be returned
   */
  public getRevision(revisionId: number): Image360RevisionEntity {
    const revision = this._revisions.find(revision => revisionId === revision.revisionId);
    return revision ? revision : this.getMostRecentRevision();
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
