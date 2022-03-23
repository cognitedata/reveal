## 1.1.24

- Removed @types/pdfjs-dist - as types are provided by pdfjs-dist package

## 1.1.23

- BUG: Correct negative coordinates on drawn shapes

## 1.1.16

- BUG: Accept relativeTo field for zoomToGroup options

## 1.1.15

- BUG: Persist comment shape ids

## 1.1.14

- FEAT: Include PDF page information in group

## 1.1.3

- BUG: Ensure documents are always visible on export
- BUG: Use inGroup as well as attached group to determine if shape should be added to group
- BUG: Ensure x and y is always set

## 1.1.2

- BUG: Add high z index to text tool input field

## 1.1.1

- BUG: Only draw comments if type = comment
- BUG: Don't insert image before its ready for stamp tool

## 1.1.0

- Add stamp tool
- Better editable shapes
- 'zoomTo' improvements

## 1.0.1

- `addDrawings` now returns the drawings it creates

## 1.0.0

Initial library includes. Readme contains features
