/*!
 * Copyright 2024 Cognite AS
 */

export class Changes {
  // Domain object boolean states changed
  public static readonly visibleState: symbol = Symbol('visibleState');
  public static readonly active: symbol = Symbol('active');
  public static readonly expanded: symbol = Symbol('expanded');
  public static readonly selected: symbol = Symbol('selected');
  public static readonly focus: symbol = Symbol('focus');
  public static readonly clipping: symbol = Symbol('clipping');

  // Domain object Fields changed
  public static readonly naming: symbol = Symbol('naming');
  public static readonly color: symbol = Symbol('color');
  public static readonly icon: symbol = Symbol('icon');
  public static readonly colorMap: symbol = Symbol('colorMap');
  public static readonly renderStyle: symbol = Symbol('renderStyle');
  public static readonly unit: symbol = Symbol('unit');

  // Something in the geometry changed
  public static readonly geometry: symbol = Symbol('geometry');
  public static readonly geometryPart: symbol = Symbol('geometryPart');
  public static readonly deletePart: symbol = Symbol('deletePart');
  public static readonly addPart: symbol = Symbol('addPart');

  // Parent-child relationship changed
  public static readonly added: symbol = Symbol('added'); // When added to the system
  public static readonly deleted: symbol = Symbol('deleted'); // When deleted from the system
  public static readonly childDeleted: symbol = Symbol('childDeleted'); // When a child is deleted
  public static readonly childAdded: symbol = Symbol('childAdded'); // When a child is added
}
