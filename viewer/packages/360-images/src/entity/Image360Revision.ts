/*!
 * Copyright 2022 Cognite AS
 */

import { Image360 } from './Image360';
import { Image360Annotation } from '../annotation/Image360Annotation';

/**
 * Interface used to manage historical revisions of {@link Image360}.
 * One instance represents one specific image revision.
 */
export type Image360Revision = {
  /**
   * The date of this revision. Undefined if the revision is undated.
   * @returns Date | undefined
   */
  readonly date: Date | undefined;

  /**
   * The annotations associated with this revision.
   */
  getAnnotations(): Promise<Image360Annotation[]>;

  /**
   * Get the thumbnail url for this revision.
   */
  getPreviewThumbnailUrl(): Promise<string | undefined>;
};
