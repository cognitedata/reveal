import { CogniteEvent } from 'cognite-sdk-v3';

// TODO(DE-136) What to do with these utils?
export const renderTitle = (event?: CogniteEvent) => {
  let title = '';
  if (event) {
    if (event.type) {
      title += event.type;
      if (event.subtype) {
        title += ': ';
      }
    }
    if (event.subtype) {
      title += event.subtype;
    }
  }
  return title;
};
