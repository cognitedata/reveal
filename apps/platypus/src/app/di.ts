import {
  DateUtilsImpl,
  StorageProviderFactoryImpl,
  TimeUtilsImpl,
} from '@platypus/platypus-infrastructure';

export default {
  dateUtils: new DateUtilsImpl(),
  timeUtils: new TimeUtilsImpl(),
  storageProviderFactory: new StorageProviderFactoryImpl(),
};
