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
}
