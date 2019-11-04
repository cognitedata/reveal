/*!
 * Copyright 2019 Cognite AS
 */

import { FetchSectorMetadataDelegate, FetchSectorDelegate, FetchCtmDelegate } from '../models/sector/delegates';

export type SectorModel = [FetchSectorMetadataDelegate, FetchSectorDelegate, FetchSectorDelegate, FetchCtmDelegate];
