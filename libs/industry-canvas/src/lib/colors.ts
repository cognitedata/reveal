import { Colors } from '@cognite/cogs.js';
import { rgba } from 'polished';

const fillOpacity = 0.9;
export const SHAPE_ANNOTATION_FILL_COLOR_MAP = {
  TRANSPARENT: 'transparent',
  BLUE: rgba(Colors['decorative--blue--300'], fillOpacity),
  GREEN: rgba(Colors['decorative--green--300'], fillOpacity),
  ORANGE: rgba(Colors['decorative--orange--300'], fillOpacity),
  RED: rgba(Colors['decorative--red--300'], fillOpacity),
  YELLOW: rgba(Colors['decorative--yellow--300'], fillOpacity),
} as const;

export const SHAPE_ANNOTATION_STROKE_COLOR_MAP = {
  TRANSPARENT: 'transparent',
  BLUE: Colors['decorative--blue--600'],
  GREEN: Colors['decorative--green--600'],
  ORANGE: Colors['decorative--orange--600'],
  RED: Colors['decorative--red--600'],
  YELLOW: Colors['decorative--yellow--600'],
} as const;

export const TEXT_ANNOTATION_COLOR_MAP = {
  BLUE: Colors['text-icon--status-neutral'],
  GREEN: Colors['text-icon--status-success'],
  BROWN: Colors['text-icon--status-warning'],
  RED: Colors['text-icon--status-critical'],
  BLACK: Colors['text-icon--strong'],
} as const;

export const STICKY_ANNOTATION_COLOR_MAP = {
  YELLOW: Colors['decorative--yellow--300'],
  ORANGE: Colors['decorative--orange--300'],
  GREEN: Colors['decorative--green--300'],
  BLUE: Colors['decorative--blue--300'],
};
