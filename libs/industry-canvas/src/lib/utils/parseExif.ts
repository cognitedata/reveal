import exifr from 'exifr';

import { FileGeoLocation } from '@cognite/sdk/dist/src';

// The exifr library isn't properly typed, so we define the types ourselves
export type ExifTags = {
  Orientation?: number;
  FocalLength?: number;
  FocalLengthIn35mmFormat?: number;
  GPSVersionID?: number[];
  GPSImgDirection?: number;
  GPSImgDirectionRef?: string;
  GPSDateStamp?: string;
};

type Coordinates = {
  longitude: number;
  latitude: number;
};

const parseExif = async (
  file: File
): Promise<{ geoLocation?: FileGeoLocation; exifTags?: ExifTags }> => {
  const exifTags: ExifTags | undefined = await exifr.parse(file, [
    'Orientation',
    'FocalLength',
    'FocalLengthIn35mmFormat',
    'GPSVersionID',
    'GPSImgDirection',
    'GPSImgDirectionRef',
    'GPSDateStamp',
  ]);

  const coordinates: Coordinates | undefined = await exifr.gps(file);

  if (coordinates === undefined) {
    return { exifTags };
  }

  const geoLocation: FileGeoLocation = {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [
        Number(coordinates.longitude.toFixed(6)),
        Number(coordinates.latitude.toFixed(6)),
      ],
    },
  };

  return { geoLocation, exifTags };
};

export default parseExif;
