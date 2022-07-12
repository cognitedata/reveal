import { groupAnnotationsByFile } from 'src/api/utils/groupAnnotationsByFile';
import { mockAnnotationList } from 'src/__test-utils/fixtures/annotationsV1';
import { LegacyVisionAnnotation } from 'src/api/annotation/legacyTypes';

describe('test groupAnnotationsByFile', () => {
  test('should handle empty array', () => {
    const fileAnnotationMap = groupAnnotationsByFile([]);
    expect(fileAnnotationMap).toBeInstanceOf(Map);
    expect(fileAnnotationMap.size).toEqual(0);
  });

  test('should group single annotation', () => {
    const mockAnnotation = mockAnnotationList[0] as LegacyVisionAnnotation;
    const fileAnnotationMap = groupAnnotationsByFile([mockAnnotation]);
    expect(fileAnnotationMap).toBeInstanceOf(Map);
    expect(fileAnnotationMap.size).toEqual(1);
    expect(
      fileAnnotationMap.get(mockAnnotation.annotatedResourceId)
    ).toStrictEqual([mockAnnotation]);
  });

  test('should group annotations for different files', () => {
    const mockAnnotationFileOne =
      mockAnnotationList[0] as LegacyVisionAnnotation;
    const mockAnnotationFileTwo =
      mockAnnotationList[1] as LegacyVisionAnnotation;
    const fileAnnotationMap = groupAnnotationsByFile([
      mockAnnotationFileOne,
      mockAnnotationFileTwo,
    ]);
    expect(fileAnnotationMap).toBeInstanceOf(Map);
    expect(fileAnnotationMap.size).toEqual(2);
    expect(
      fileAnnotationMap.get(mockAnnotationFileOne.annotatedResourceId)
    ).toStrictEqual([mockAnnotationFileOne]);
    expect(
      fileAnnotationMap.get(mockAnnotationFileTwo.annotatedResourceId)
    ).toStrictEqual([mockAnnotationFileTwo]);
  });
});
