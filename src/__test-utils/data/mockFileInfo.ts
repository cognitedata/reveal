import { FileInfo } from '@cognite/sdk';
import { MimeTypes } from 'src/constants/validMimeTypes';

/**
 * Test data for test filterByTime fn
 * 12 file objects
 * files of 4 days (2021/1/1 - 2021/1/4), 3 file for each day
 * each day has three files with 7.00AM, 12.00PM, 3.00PM time stamps.
 *  created, updated and sourceCreated same particular file
 */
export const mockFileInfo: FileInfo[] = [
  {
    id: 1,
    uploaded: true,
    name: 'one',
    createdTime: new Date(2021, 0, 1, 7, 0, 0, 0),
    lastUpdatedTime: new Date(2021, 0, 1, 7, 0, 0, 0),
    sourceCreatedTime: new Date(2021, 0, 1, 7, 0, 0, 0),
    uploadedTime: new Date(2021, 0, 1, 7, 0, 0, 0),
    mimeType: MimeTypes.jpg,
  },
  {
    id: 2,
    uploaded: true,
    name: 'two',
    createdTime: new Date(2021, 0, 1, 12, 0, 0, 0),
    lastUpdatedTime: new Date(2021, 0, 1, 12, 0, 0, 0),
    sourceCreatedTime: new Date(2021, 0, 1, 12, 0, 0, 0),
    uploadedTime: new Date(2021, 0, 1, 12, 0, 0, 0),
    mimeType: MimeTypes.jpg,
  },
  {
    id: 3,
    uploaded: true,
    name: 'three',
    createdTime: new Date(2021, 0, 1, 15, 0, 0, 0),
    lastUpdatedTime: new Date(2021, 0, 1, 15, 0, 0, 0),
    sourceCreatedTime: new Date(2021, 0, 1, 15, 0, 0, 0),
    uploadedTime: new Date(2021, 0, 1, 15, 0, 0, 0),
    mimeType: MimeTypes.jpg,
  },
  {
    id: 4,
    uploaded: true,
    name: 'fore',
    createdTime: new Date(2021, 0, 2, 7, 0, 0, 0),
    lastUpdatedTime: new Date(2021, 0, 2, 7, 0, 0, 0),
    sourceCreatedTime: new Date(2021, 0, 2, 7, 0, 0, 0),
    uploadedTime: new Date(2021, 0, 2, 7, 0, 0, 0),
    mimeType: MimeTypes.jpeg,
  },
  {
    id: 5,
    uploaded: true,
    name: 'five',
    createdTime: new Date(2021, 0, 2, 12, 0, 0, 0),
    lastUpdatedTime: new Date(2021, 0, 2, 12, 0, 0, 0),
    sourceCreatedTime: new Date(2021, 0, 2, 12, 0, 0, 0),
    uploadedTime: new Date(2021, 0, 2, 12, 0, 0, 0),
    mimeType: MimeTypes.jpeg,
  },
  {
    id: 6,
    uploaded: true,
    name: 'six',
    createdTime: new Date(2021, 0, 2, 15, 0, 0, 0),
    lastUpdatedTime: new Date(2021, 0, 2, 15, 0, 0, 0),
    sourceCreatedTime: new Date(2021, 0, 2, 15, 0, 0, 0),
    uploadedTime: new Date(2021, 0, 2, 15, 0, 0, 0),
    mimeType: MimeTypes.jpeg,
  },
  {
    id: 7,
    uploaded: true,
    name: 'seven',
    createdTime: new Date(2021, 0, 3, 7, 0, 0, 0),
    lastUpdatedTime: new Date(2021, 0, 3, 7, 0, 0, 0),
    sourceCreatedTime: new Date(2021, 0, 3, 7, 0, 0, 0),
    uploadedTime: new Date(2021, 0, 3, 7, 0, 0, 0),
    mimeType: MimeTypes.png,
  },
  {
    id: 8,
    uploaded: true,
    name: 'eight',
    createdTime: new Date(2021, 0, 3, 12, 0, 0, 0),
    lastUpdatedTime: new Date(2021, 0, 3, 12, 0, 0, 0),
    sourceCreatedTime: new Date(2021, 0, 3, 12, 0, 0, 0),
    uploadedTime: new Date(2021, 0, 3, 12, 0, 0, 0),
    mimeType: MimeTypes.png,
  },
  {
    id: 9,
    uploaded: true,
    name: 'nine',
    createdTime: new Date(2021, 0, 3, 15, 0, 0, 0),
    lastUpdatedTime: new Date(2021, 0, 3, 15, 0, 0, 0),
    sourceCreatedTime: new Date(2021, 0, 3, 15, 0, 0, 0),
    uploadedTime: new Date(2021, 0, 3, 15, 0, 0, 0),
    mimeType: MimeTypes.mp4,
  },
  {
    id: 10,
    uploaded: true,
    name: 'ten',
    createdTime: new Date(2021, 0, 4, 4, 0, 0, 0),
    lastUpdatedTime: new Date(2021, 0, 4, 4, 0, 0, 0),
    sourceCreatedTime: new Date(2021, 0, 4, 4, 0, 0, 0),
    uploadedTime: new Date(2021, 0, 4, 4, 0, 0, 0),
    mimeType: MimeTypes.mp4,
  },
  {
    id: 11,
    uploaded: true,
    name: 'eleven',
    createdTime: new Date(2021, 0, 4, 12, 0, 0, 0),
    lastUpdatedTime: new Date(2021, 0, 4, 12, 0, 0, 0),
    sourceCreatedTime: new Date(2021, 0, 4, 12, 0, 0, 0),
    uploadedTime: new Date(2021, 0, 4, 12, 0, 0, 0),
    mimeType: MimeTypes.webm,
  },
  {
    id: 12,
    uploaded: true,
    name: 'twelve',
    createdTime: new Date(2021, 0, 4, 15, 0, 0, 0),
    lastUpdatedTime: new Date(2021, 0, 4, 15, 0, 0, 0),
    sourceCreatedTime: new Date(2021, 0, 4, 15, 0, 0, 0),
    uploadedTime: new Date(2021, 0, 4, 15, 0, 0, 0),
    mimeType: MimeTypes.webm,
  },
];
export const mockFileIds = mockFileInfo.map((file) => file.id);
export const INVALID_FILE_ID = mockFileIds.length + 1;

// Sorted by name
export const mockFileIdsSortedByNameAscending = [
  8, 11, 5, 4, 9, 1, 7, 6, 10, 3, 12, 2,
];
export const mockFileIdsSortedByNameDescending =
  mockFileIdsSortedByNameAscending.slice().reverse();

// Sorted by Mime Type
export const mockFileIdsSortedByMimeTypeAscending = [
  6, 5, 4, 3, 2, 1, 8, 7, 10, 9, 12, 11,
];
export const mockFileIdsSortedByMimeTypeDescending = [
  12, 11, 10, 9, 8, 7, 3, 2, 1, 6, 5, 4,
];
