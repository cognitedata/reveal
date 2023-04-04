/*!
 * Copyright 2022 Cognite AS
 */

/**
 * Interface used to manage historical revisions of {@link Image360}.
 * One instance represents one specific image revision.
 */
export interface Image360Revision {
  /**
   * The date of this revision. Undefined if the revison is undated.
   * @returns Date | undefined
   */
  readonly date: Date | undefined;
}
