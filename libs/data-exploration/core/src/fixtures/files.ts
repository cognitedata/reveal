import { FileInfo } from '@cognite/sdk/dist/src';

function* idMaker(): Generator<number> {
  let index = 1000;
  while (true) {
    yield index++;
  }
}

const id = idMaker();

export const fileWithExtentionAndMimeType: FileInfo = {
  id: id.next().value,
  name: 'Test_JPG_File.jpg',
  mimeType: 'image/jpg',
  uploaded: true,
  createdTime: new Date(2021, 0, 1, 7, 0, 0, 0),
  lastUpdatedTime: new Date(2021, 0, 1, 7, 0, 0, 0),
  sourceCreatedTime: new Date(2021, 0, 1, 7, 0, 0, 0),
};

export const fileWithExtention: FileInfo = {
  id: id.next().value,
  name: 'Test_JPG_File.jpg',
  uploaded: true,
  createdTime: new Date(2021, 0, 1, 7, 0, 0, 0),
  lastUpdatedTime: new Date(2021, 0, 1, 7, 0, 0, 0),
  sourceCreatedTime: new Date(2021, 0, 1, 7, 0, 0, 0),
};

export const fileWithMimeType: FileInfo = {
  id: id.next().value,
  name: 'Test_JPG_File',
  mimeType: 'image/jpg',
  uploaded: true,
  createdTime: new Date(2021, 0, 1, 7, 0, 0, 0),
  lastUpdatedTime: new Date(2021, 0, 1, 7, 0, 0, 0),
  sourceCreatedTime: new Date(2021, 0, 1, 7, 0, 0, 0),
};

export const fileWithoutExtentionAndMimeType: FileInfo = {
  id: id.next().value,
  name: 'Test_JPG_File',
  uploaded: true,
  createdTime: new Date(2021, 0, 1, 7, 0, 0, 0),
  lastUpdatedTime: new Date(2021, 0, 1, 7, 0, 0, 0),
  sourceCreatedTime: new Date(2021, 0, 1, 7, 0, 0, 0),
};

export const CORRECT_TYPE = 'jpg';
export const INCORRECT_TYPE = 'png';
