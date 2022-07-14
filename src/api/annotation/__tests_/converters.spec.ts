import {
  ImageAssetLink,
  ImageExtractedText,
  ImageKeypointCollection,
  ImageObjectDetectionBoundingBox,
  ImageObjectDetectionPolygon,
  ImageObjectDetectionPolyline,
} from 'src/api/annotation/types';
import { VisionAnnotation } from 'src/modules/Common/types';
import { convertCDFAnnotationToVisionAnnotations } from 'src/api/annotation/converters';
import {
  invalidCDFAnnotation1,
  sampleCDFAnnotation5,
  sampleCDFAnnotation6,
  sampleCDFAnnotation7,
  sampleCDFAnnotations,
} from 'src/__test-utils/fixtures/annotationsCDF';

describe('Test convertCDFAnnotationToVisionAnnotations fn', () => {
  test('for empty array', () => {
    expect(convertCDFAnnotationToVisionAnnotations([])).toStrictEqual([]);
  });

  test('annotation with invalid annotation type should ignored', () => {
    expect(
      convertCDFAnnotationToVisionAnnotations([invalidCDFAnnotation1])
    ).toStrictEqual([]);
  });

  describe('for CDF annotations', () => {
    const visionAnnotations =
      convertCDFAnnotationToVisionAnnotations(sampleCDFAnnotations);

    describe('selected properties should copy as it is and should get time from Dates', () => {
      for (let i = 0; i < 10; i++) {
        test(`sampleCDFAnnotations-${i}`, () => {
          expect(visionAnnotations[i].id).toStrictEqual(
            sampleCDFAnnotations[i].id
          );
          expect(visionAnnotations[i].createdTime).toStrictEqual(
            sampleCDFAnnotations[i].createdTime.getTime()
          );
          expect(visionAnnotations[i].lastUpdatedTime).toStrictEqual(
            sampleCDFAnnotations[i].lastUpdatedTime.getTime()
          );
          expect(visionAnnotations[i].status).toStrictEqual(
            sampleCDFAnnotations[i].status
          );
          expect(visionAnnotations[i].annotatedResourceId).toStrictEqual(
            sampleCDFAnnotations[i].annotatedResourceId
          );
          expect(visionAnnotations[i].annotationType).toStrictEqual(
            sampleCDFAnnotations[i].annotationType
          );
        });
      }
    });

    describe('testing the conversion of data', () => {
      describe('images.TextRegion annotation', () => {
        for (let i = 0; i < 4; i++) {
          test(`TextRegion annotation - sample-${i + 1}`, () => {
            const convertedAnnotation = visionAnnotations[
              i
            ] as VisionAnnotation<ImageExtractedText>;

            expect({
              confidence: convertedAnnotation.confidence,
              text: convertedAnnotation.text,
              textRegion: convertedAnnotation.textRegion,
            }).toStrictEqual(sampleCDFAnnotations[i].data);
          });
        }
      });

      describe('images.KeypointCollection annotation', () => {
        test('KeypointCollection annotation without confidence - sample-5', () => {
          const convertedAnnotation =
            visionAnnotations[4] as VisionAnnotation<ImageKeypointCollection>;
          expect(convertedAnnotation.label).toStrictEqual(
            sampleCDFAnnotation5.data.label
          );
          expect(convertedAnnotation.keypoints).toStrictEqual({
            center: {
              point: sampleCDFAnnotation5.data.keypoints.center.point,
            },
            start: {
              point: sampleCDFAnnotation5.data.keypoints.start.point,
            },
            stop: {
              point: sampleCDFAnnotation5.data.keypoints.stop.point,
            },
            tip: {
              point: sampleCDFAnnotation5.data.keypoints.tip.point,
            },
          });
        });

        test('KeypointCollection annotation with confidence - sample-6', () => {
          const convertedAnnotation =
            visionAnnotations[5] as VisionAnnotation<ImageKeypointCollection>;
          expect(convertedAnnotation.label).toStrictEqual(
            sampleCDFAnnotation6.data.label
          );
          expect(convertedAnnotation.keypoints).toStrictEqual({
            'point 1': {
              point: sampleCDFAnnotation6.data.keypoints['point 1'].point,
              confidence:
                sampleCDFAnnotation6.data.keypoints['point 1'].confidence,
            },
            'point 2': {
              point: sampleCDFAnnotation6.data.keypoints['point 2'].point,
              confidence:
                sampleCDFAnnotation6.data.keypoints['point 2'].confidence,
            },
            'point 3': {
              point: sampleCDFAnnotation6.data.keypoints['point 3'].point,
              confidence:
                sampleCDFAnnotation6.data.keypoints['point 3'].confidence,
            },
          });
        });

        test('KeypointCollection annotation with numbers as keys - sample-7', () => {
          const convertedAnnotation =
            visionAnnotations[6] as VisionAnnotation<ImageKeypointCollection>;
          expect(convertedAnnotation.label).toStrictEqual(
            sampleCDFAnnotation7.data.label
          );
          expect(convertedAnnotation.keypoints).toStrictEqual({
            '1': {
              point: sampleCDFAnnotation7.data.keypoints['1'].point,
              confidence: sampleCDFAnnotation7.data.keypoints['1'].confidence,
            },
          });
        });
      });

      describe('images.ObjectDetection annotation', () => {
        test('ObjectDetection boundingBox annotation - sample-8', () => {
          const convertedAnnotation =
            visionAnnotations[7] as VisionAnnotation<ImageObjectDetectionBoundingBox>;

          expect({
            label: convertedAnnotation.label,
            boundingBox: convertedAnnotation.boundingBox,
          }).toStrictEqual(sampleCDFAnnotations[7].data);
        });

        test('ObjectDetection polygon annotation - sample-9', () => {
          const convertedAnnotation =
            visionAnnotations[8] as VisionAnnotation<ImageObjectDetectionPolygon>;

          expect({
            label: convertedAnnotation.label,
            polygon: convertedAnnotation.polygon,
          }).toStrictEqual(sampleCDFAnnotations[8].data);
        });

        test('ObjectDetection polyline annotation - sample-10', () => {
          const convertedAnnotation =
            visionAnnotations[9] as VisionAnnotation<ImageObjectDetectionPolyline>;

          expect({
            label: convertedAnnotation.label,
            polyline: convertedAnnotation.polyline,
          }).toStrictEqual(sampleCDFAnnotations[9].data);
        });
      });

      describe('images.AssetLink annotation', () => {
        test('AssetLink annotation - sample-11', () => {
          const convertedAnnotation =
            visionAnnotations[10] as VisionAnnotation<ImageAssetLink>;

          expect({
            text: convertedAnnotation.text,
            confidence: convertedAnnotation.confidence,
            assetRef: convertedAnnotation.assetRef,
            textRegion: convertedAnnotation.textRegion,
          }).toStrictEqual(sampleCDFAnnotations[10].data);
        });
      });
    });
  });
});
