/*!
 * Copyright 2020 Cognite AS
 */

export interface ExternalSource {
  discriminator: 'external';
  url: string;
}
