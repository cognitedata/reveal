/*!
 * Copyright 2022 Cognite AS
 */

import { Image360Revision } from './Image360Revision';

export interface Image360 {
  /**
   * Set the opacity of all images in this entity.
   */
  setOpacity(alpha: number): void;

  /**
   * List the ids and dates for all available revisions. If a revison is undated, the date will be undefined.
   * @returns A list of id and date pairs, sorted with the most recent date first.
   * */
  list360ImageRevisions(): { id: number; date?: Date }[];

  /**
   * Get the revision that is currently loaded for this entry.
   * @returns Returns the active revision.
   */
  getActiveRevision(): Image360Revision;

  /**
   * Will reload the entity with images from the new revision.
   * Resolves once loading is complete. Rejects if revision could not be changed.
   * If the entity is not entered/visible the promise will be resolved instantly.
   *
   * @param revisionId The id of the revision to show.
   * @param keepDate If true any subsequently opened images will use revisions that are closest to the date of this revision.
   * If false, the most recent revision will be loaded.
   *
   * @returns Promise for when revision has either been updated or it failed to change.
   */
  changeRevision(revisionId: number, keepDate?: boolean): Promise<void>;
}
