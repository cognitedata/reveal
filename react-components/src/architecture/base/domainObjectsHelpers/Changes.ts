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
  public static readonly dragging: symbol = Symbol('dragging');

  // Part of the domain object changed
  public static readonly changedPart: symbol = Symbol('changedPart');
  public static readonly deletedPart: symbol = Symbol('deletedPart');
  public static readonly addedPart: symbol = Symbol('addedPart');
  public static readonly newPending: symbol = Symbol('newPending');

  // Parent-child relationship changed
  public static readonly added: symbol = Symbol('added'); // When added to the system
  public static readonly deleting: symbol = Symbol('deleting'); // When deleting from the system
  public static readonly deleted: symbol = Symbol('deleted'); // When deleted from the system
  public static readonly childDeleted: symbol = Symbol('childDeleted'); // When a child is deleted
  public static readonly childAdded: symbol = Symbol('childAdded'); // When a child is added

  public static readonly loaded: symbol = Symbol('loaded');
}
