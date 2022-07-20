/* eslint-disable jest/no-disabled-tests */
import {
  AnnotationMeta,
  AnnotatorRegion,
  AnnotatorRegionType,
} from 'src/modules/Review/Components/ReactImageAnnotateWrapper/types';
import { CDFAnnotationTypeEnum, Status } from 'src/api/annotation/types';
import { cropBoxRegionAtEdges } from 'src/modules/Review/Components/ReactImageAnnotateWrapper/utils/cropBoxRegionAtEdges';

const baseRegion: AnnotatorRegion = {
  id: 1,
  color: 'red',
  annotationMeta: {} as AnnotationMeta,
  status: Status.Approved,
  annotationType: CDFAnnotationTypeEnum.ImagesObjectDetection,
  annotationLabelOrText: 'dummy-label',
  type: AnnotatorRegionType.BoxRegion,

  x: 0.25,
  y: 0.25,
  w: 0.5,
  h: 0.5,
};

describe('if region is a box', () => {
  describe('test cropBoxRegionAtEdges fn', () => {
    describe('for invalid x or y values', () => {
      const dummyRegion = baseRegion;
      test('with x value of grater than 1', () => {
        const region = { ...dummyRegion, x: 1.5 };
        expect(cropBoxRegionAtEdges(region)).toEqual(region);
      });

      test('with y value of grater than 1', () => {
        const region = { ...dummyRegion, y: 1.5 };
        expect(cropBoxRegionAtEdges(region)).toEqual(region);
      });

      test('with both x and y values are grater than 1', () => {
        const region = { ...dummyRegion, x: 1.5, y: 1.5 };
        expect(cropBoxRegionAtEdges(region)).toEqual(region);
      });
    });

    describe('for valid x or y values', () => {
      describe('positive x or y values', () => {
        const dummyRegion = baseRegion;
        test('valid w and h', () => {
          const region = { ...dummyRegion };
          expect(cropBoxRegionAtEdges(region)).toEqual(region);
        });

        test('invalid w', () => {
          const region = { ...dummyRegion, w: 0.8 };
          expect(cropBoxRegionAtEdges(region)).toEqual({ ...region, w: 0.75 });
        });

        test('invalid h', () => {
          const region = { ...dummyRegion, h: 0.8 };
          expect(cropBoxRegionAtEdges(region)).toEqual({ ...region, h: 0.75 });
        });

        test('invalid w and h', () => {
          const region = { ...dummyRegion, w: 0.8, h: 0.8 };
          expect(cropBoxRegionAtEdges(region)).toEqual({
            ...region,
            w: 0.75,
            h: 0.75,
          });
        });
      });

      describe('negative x value', () => {
        const dummyRegion = { ...baseRegion, x: -0.25 };
        test('valid w and h', () => {
          const region = { ...dummyRegion };
          expect(cropBoxRegionAtEdges(region)).toEqual({ ...region, x: 0 });
        });

        test('invalid w', () => {
          const region = { ...dummyRegion, w: 1.5 };
          expect(cropBoxRegionAtEdges(region)).toEqual({
            ...region,
            x: 0,
            w: 1,
          });
        });

        test('invalid h', () => {
          const region = { ...dummyRegion, h: 0.8 };
          expect(cropBoxRegionAtEdges(region)).toEqual({
            ...region,
            x: 0,
            h: 0.75,
          });
        });

        test('invalid w and h', () => {
          const region = { ...dummyRegion, w: 1.25, h: 0.8 };
          expect(cropBoxRegionAtEdges(region)).toEqual({
            ...region,
            x: 0,
            w: 1,
            h: 0.75,
          });
        });
      });

      describe('negative y value', () => {
        const dummyRegion = { ...baseRegion, y: -0.3 };
        test('valid w and h', () => {
          const region = { ...dummyRegion };
          expect(cropBoxRegionAtEdges(region)).toEqual({ ...region, y: 0 });
        });

        test('invalid w', () => {
          const region = { ...dummyRegion, w: 0.9 };
          expect(cropBoxRegionAtEdges(region)).toEqual({
            ...region,
            y: 0,
            w: 0.75,
          });
        });

        test('invalid h', () => {
          const region = { ...dummyRegion, h: 1.5 };
          expect(cropBoxRegionAtEdges(region)).toEqual({
            ...region,
            y: 0,
            h: 1,
          });
        });

        test('invalid w and h', () => {
          const region = { ...dummyRegion, w: 0.9, h: 1.3 };
          expect(cropBoxRegionAtEdges(region)).toEqual({
            ...region,
            y: 0,
            w: 0.75,
            h: 1,
          });
        });
      });

      describe('negative x and y values', () => {
        const dummyRegion = { ...baseRegion, x: -0.4, y: -0.5 };
        test('valid w and h', () => {
          const region = { ...dummyRegion };
          expect(cropBoxRegionAtEdges(region)).toEqual({
            ...region,
            x: 0,
            y: 0,
          });
        });

        test('invalid w', () => {
          const region = { ...dummyRegion, w: 1.8 };
          expect(cropBoxRegionAtEdges(region)).toEqual({
            ...region,
            x: 0,
            y: 0,
            w: 1,
          });
        });

        test('invalid h', () => {
          const region = { ...dummyRegion, h: 1.8 };
          expect(cropBoxRegionAtEdges(region)).toEqual({
            ...region,
            x: 0,
            y: 0,
            h: 1,
          });
        });

        test('invalid w and h', () => {
          const region = { ...dummyRegion, w: 1.8, h: 1.8 };
          expect(cropBoxRegionAtEdges(region)).toEqual({
            ...region,
            x: 0,
            y: 0,
            w: 1,
            h: 1,
          });
        });
      });
    });
  });
});
