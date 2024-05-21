/*!
 * Copyright 2024 Cognite AS
 */

export class Changes {
  // States changed
  public static readonly visibleState: symbol = Symbol('visibleState');
  public static readonly active: symbol = Symbol('active');
  public static readonly expanded: symbol = Symbol('expanded');
  public static readonly selected: symbol = Symbol('selected');
  public static readonly focus: symbol = Symbol('focus');
  public static readonly loaded: symbol = Symbol('loaded');

  // Fields changed
  public static readonly nameing: symbol = Symbol('nameing');
  public static readonly color: symbol = Symbol('color');
  public static readonly icon: symbol = Symbol('icon');
  public static readonly colorMap: symbol = Symbol('colorMap');
  public static readonly geometry: symbol = Symbol('geometry');
  public static readonly renderStyle: symbol = Symbol('renderStyle');

  // Parent-child relationship changed
  public static readonly childDeleted: symbol = Symbol('childDeleted');
  public static readonly childAdded: symbol = Symbol('childAdded');

  public static readonly added: symbol = Symbol('added');
  public static readonly deleted: symbol = Symbol('deleted');
}
