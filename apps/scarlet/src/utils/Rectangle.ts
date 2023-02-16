export interface IRectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export class Rectangle {
  // Checks to see if the bounds of rectangle2 intersect with rectangle1
  public static Intersects = (
    rectangle1: IRectangle, // The target of intersection.
    rectangle2: IRectangle // The bounds of potential intersection.
  ): boolean => {
    return (
      rectangle1.x + rectangle1.width >= rectangle2.x &&
      rectangle1.x <= rectangle2.x + rectangle2.width &&
      rectangle1.y + rectangle1.height >= rectangle2.y &&
      rectangle1.y <= rectangle2.y + rectangle2.height
    );
  };

  // Returns a rectangle with dimensions representing the area of intersection
  // between rectangle1 and rectangle2.  Returns undefined if no intersection exists.
  public static Intersect = (
    rectangle1: IRectangle, // The target of intersection.
    rectangle2: IRectangle // The bounds of potential intersection.
  ): IRectangle | undefined => {
    // Check if rectangles intersect.
    if (!Rectangle.Intersects(rectangle1, rectangle2)) return undefined;

    // Calculate right and bottom values
    const rectangle1Right = rectangle1.x + rectangle1.width;
    const rectangle2Right = rectangle2.x + rectangle2.width;
    const rectangle1Bottom = rectangle1.y + rectangle1.height;
    const rectangle2Bottom = rectangle2.y + rectangle2.height;

    // Get the overlap values
    const left = Math.max(rectangle1.x, rectangle2.x);
    const right = Math.min(rectangle1Right, rectangle2Right);
    const top = Math.max(rectangle1.y, rectangle2.y);
    const bottom = Math.min(rectangle1Bottom, rectangle2Bottom);

    if (left < right && top < bottom)
      return { x: left, y: top, width: right - left, height: bottom - top };

    return undefined;
  };

  public static Area = (rectangle: IRectangle): number => {
    if (rectangle?.width && rectangle?.height)
      return rectangle.width * rectangle.height;

    return 0;
  };

  // Calculates the percentage of rectangle1 that is intersected by rectangle2
  public static IntersectPercentage = (
    rectangle1: IRectangle | undefined, // The target of intersection.
    rectangle2: IRectangle | undefined // The bounds of potential intersection.
  ): number => {
    // Check for required values.
    if (!rectangle1 || !rectangle2) return 0;

    // Get rectangle representing intersecting area.
    const intersect = Rectangle.Intersect(rectangle1, rectangle2);

    // If no intersection detected, return 0
    if (!intersect) return 0;
    const intersectArea = Rectangle.Area(intersect);
    const rectangle1Area = Rectangle.Area(rectangle1);
    return intersectArea / rectangle1Area;
  };
}
