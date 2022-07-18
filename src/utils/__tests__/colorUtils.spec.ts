import { predefinedAnnotations } from 'src/__test-utils/fixtures/predefinedAnnotations';
import { CDFAnnotationTypeEnum } from 'src/api/annotation/types';
import {
  ColorsObjectDetection,
  ColorsOCR,
  ColorsPersonDetection,
  ColorsTagDetection,
  HEX_COLOR_CODE_REGEX,
} from 'src/constants/Colors';
import {
  getAnnotationColor,
  getAnnotationColorFromColorKey,
  getPredefinedAnnotationColor,
} from 'src/utils/colorUtils';

describe('Test Color utils', () => {
  const colorMap = {
    test: '#FFFFFF',
    test2: '#7F7F7F',
  };
  describe('Test getAnnotationColorFromColorKey', () => {
    test('when color for key not available', () => {
      expect(getAnnotationColorFromColorKey(colorMap, 'test3')).toBe(
        ColorsObjectDetection.color
      );
    });
    test('when color for key not available but text is person', () => {
      expect(getAnnotationColorFromColorKey(colorMap, 'person')).toBe(
        ColorsPersonDetection.color
      );
    });
    test('when color for key is available in color map', () => {
      expect(getAnnotationColorFromColorKey(colorMap, 'test2')).toBe(
        colorMap.test2
      );
    });
    test('when colormap is empty', () => {
      expect(getAnnotationColorFromColorKey({}, 'test2')).toBe(
        ColorsObjectDetection.color
      );
    });
    test('when colorKey is empty', () => {
      expect(getAnnotationColorFromColorKey(colorMap, '')).toBe(
        ColorsObjectDetection.color
      );
    });
  });

  describe('Test getAnnotationColor', () => {
    test('when annotation type is not provided should provide correct color', () => {
      expect(getAnnotationColor(colorMap, 'test2')).toBe(colorMap.test2);
    });
    test('when annotation type is Asset Link should provide correct color', () => {
      expect(
        getAnnotationColor(
          colorMap,
          'test2',
          CDFAnnotationTypeEnum.ImagesAssetLink
        )
      ).toBe(ColorsTagDetection.color);
    });
    test('when annotation type is Text region should provide correct color', () => {
      expect(
        getAnnotationColor(
          colorMap,
          'test2',
          CDFAnnotationTypeEnum.ImagesTextRegion
        )
      ).toBe(ColorsOCR.color);
    });
    test('when colormap is empty', () => {
      expect(getAnnotationColor({}, 'test2')).toBe(ColorsObjectDetection.color);
    });
    test('when colorKey is empty', () => {
      expect(getAnnotationColor(colorMap, '')).toBe(
        ColorsObjectDetection.color
      );
    });
  });

  describe('Test getPredefinedAnnotationColor', () => {
    test('when data.color is available and annotation text is not sensitive should return correct color', () => {
      const predefinedAnnotationWithColorProperty = predefinedAnnotations[0];
      expect(
        getPredefinedAnnotationColor(predefinedAnnotationWithColorProperty)
      ).toBe(predefinedAnnotationWithColorProperty.data?.color);
    });
    test('when data.color is available and annotation text is sensitive should return correct color', () => {
      const predefinedAnnotationWithColorPropertyAndSensitiveText =
        predefinedAnnotations[1];
      expect(
        getPredefinedAnnotationColor(
          predefinedAnnotationWithColorPropertyAndSensitiveText
        )
      ).toBe(ColorsPersonDetection.color);
    });
    test('when data.color property is not available and is a predefined keypoint collection annotation should return correct color', () => {
      const predefinedKeypointCollectionAnnotationWithoutColorProperty =
        predefinedAnnotations[3];
      expect(
        getPredefinedAnnotationColor(
          predefinedKeypointCollectionAnnotationWithoutColorProperty
        )
      ).toBe(
        predefinedKeypointCollectionAnnotationWithoutColorProperty.data!
          .keypoints![0].color
      );
    });
    test('predefined annotation without color property or keypoints will be a random color', () => {
      const predefinedAnnotationWithoutColorProperty = {
        ...predefinedAnnotations[0],
        data: {
          ...predefinedAnnotations[0].data,
          color: undefined,
        },
      };
      expect(
        getPredefinedAnnotationColor(predefinedAnnotationWithoutColorProperty)
      ).toMatch(HEX_COLOR_CODE_REGEX);

      const predefinedKeypointCollectionAnnotationWithoutColorPropertyOrKeypoints =
        {
          ...predefinedAnnotations[3],
          data: {
            ...predefinedAnnotations[3].data,
            color: undefined,
            keypoints: [],
          },
        };

      expect(
        getPredefinedAnnotationColor(
          predefinedKeypointCollectionAnnotationWithoutColorPropertyOrKeypoints
        )
      ).toMatch(HEX_COLOR_CODE_REGEX);
    });
  });
});
