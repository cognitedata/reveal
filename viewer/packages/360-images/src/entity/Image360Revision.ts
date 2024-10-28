/*!
 * Copyright 2022 Cognite AS
 */

import { Image360 } from './Image360';
import { Image360Annotation } from '../annotation/Image360Annotation';
import { ClassicDataSourceType, DataSourceType } from '@reveal/data-providers';

/**
 * Interface used to manage historical revisions of {@link Image360}.
 * One instance represents one specific image revision.
 */
export interface Image360Revision<T extends DataSourceType = ClassicDataSourceType> {
  /**
   * The date of this revision. Undefined if the revision is undated.
   * @returns Date | undefined
   */
  readonly date: Date | undefined;

  /**
   * The annotations associated with this revision.
   */
  getAnnotations(): Promise<Image360Annotation<T>[]>;

  /**
   * Get the thumbnail url for this revision.
   */
  getPreviewThumbnailUrl(): Promise<string | undefined>;
}
