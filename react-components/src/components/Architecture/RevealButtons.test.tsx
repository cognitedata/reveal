import { describe, expect, test } from 'vitest';
import { RevealButtons } from './RevealButtons';

describe(RevealButtons.name, () => {
  test('should create buttons', () => {
    expect(RevealButtons.AnnotationsCreate).toBeDefined();
    expect(RevealButtons.AnnotationsSelect).toBeDefined();
    expect(RevealButtons.AnnotationsShow).toBeDefined();
    expect(RevealButtons.AnnotationsShowOnTop).toBeDefined();
    expect(RevealButtons.Clip).toBeDefined();
    expect(RevealButtons.DeleteSelectedPointOfInterest).toBeDefined();
    expect(RevealButtons.FitView).toBeDefined();
    expect(RevealButtons.Help).toBeDefined();
    expect(RevealButtons.Image360AnnotationCreateTool).toBeDefined();
    expect(RevealButtons.Image360AnnotationSelectTool).toBeDefined();
    expect(RevealButtons.Image360Button).toBeDefined();
    expect(RevealButtons.Image360Buttons).toBeDefined();
    expect(RevealButtons.KeyboardSpeed).toBeDefined();
    expect(RevealButtons.Measurement).toBeDefined();
    expect(RevealButtons.NavigationTool).toBeDefined();
    expect(RevealButtons.PointCloudFilter).toBeDefined();
    expect(RevealButtons.PointsOfInterest).toBeDefined();
    expect(RevealButtons.PointsOfInterestInitiateCreation).toBeDefined();
    expect(RevealButtons.SetAxisVisible).toBeDefined();
    expect(RevealButtons.SetFirstPersonMode).toBeDefined();
    expect(RevealButtons.SetOrbitMode).toBeDefined();
    expect(RevealButtons.SetOrbitOrFirstPersonMode).toBeDefined();
    expect(RevealButtons.Settings).toBeDefined();
    expect(RevealButtons.Share).toBeDefined();
    expect(RevealButtons.Undo).toBeDefined();
  });
});
