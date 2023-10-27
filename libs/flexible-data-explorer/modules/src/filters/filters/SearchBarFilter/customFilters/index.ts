import { DataTypeOption } from '@fdx/shared/types/filters';

import { files } from './files';
import { timeseries } from './timeseries';

export const customDataTypeOptions: DataTypeOption[] = [timeseries, files];
