# Introduction

The architecture I will introduce has been developed since the 1990s and has evolved with me on different applications. It is a simple yet versatile architecture that can be used in systems with hundreds of developers and millions of lines of code. It scales well without the need to change the core code.

**Reasons for using this architecture:**

- Focuses on **what** to do rather than **how**
- Faster development
- Provides a good starting point
- Consistent patterns for similar features
- Reduces friction and frustrations within teams
- Facilitates faster onboarding of new team members

**Basic concepts you will be introduced to:**

- **Domain object:** Where the data resides. Domain objects are organized in a hierarchy.
- **Render style:** Defines how the data is visualized.
- **View:** The code responsible for rendering.
- **Command:** A user action that triggers a change.
- **Tool:** Special command with 3D viewer user actions.

**The code can be divided in 3 parts:**

- The architecture itself (should be stable after a while)
- The React part (should be stable after a while)
- **The business logic: This is the part you will develop.**

**Limitations:**

- It is limited when it comes to advanced React component. Everything that can not be generalized
  must be done as usual.
- The Reveal objects, like CAD, Point clouds etc. still live somewhere inside Reveal and cannot be used as domain objects yet.
- Reveal is not a multi viewer system. This architecture support multi viewer, but cannot use it.
- I have not implemented any save and load data from CDF. This will come later.
- I have dropped several more advanced features in the architecture (for instance factories).

Instead of sliders you will during the course (hopefully) be able to make functionality to create, manipulate and delete your own domain objects. I have build up the same object in the code myself and made it as good as possible. This is called `ExampleDomainObject` and should be used as a good and simple start point for similar and hopefully more advanced functionality. I will maintain and develop this further along with new concepts.

# The exercises

Now it is your turn.

## Creating a domain object

Decide a name of the domain object. You will create something that is simple and can be moved. In the rest a assume this is a point with some extension, but it can be anything that has a single color, can be scaled and move. Let the name end with `DomainObject`, then everybody will know what type it is.

In the folder `src/architecture/concrete` make a new folder, with the name of your domain object.

In the rest of the text I will call it a `PointDomainObject` and other objects accordingly,

The this folder create the class `PointDomainObject`, extend it from `VisualDomainObject` since it should be visible. Make a field called `center`. Use Three.js primitives. A point is called `Vector3`. This point will be in CDF coordinated with Z up (I have assumed that in this example, and in my own implementation).

You override these methods, so it has a icon and a type name.

```typescript
public override get icon(): IconName {
  return 'Circle';
}

public override get typeName(): TranslationInput {
  return { untranslated: 'Example' };
}
```

Use any icons you like on the https://zeroheight.com/37d494d9d/p/99acc1-system-icons. But you have to check with DefaultIcons is the icon is installed,
because Cogs changed the way icons was loaded into the app.You can also use `IconFactory.install()` to install any icon you will like without changing the DefaultIcons.

> **&#9432; Try it out:**
> Compile it. At this moment you should be finished with your first version of the `PointDomainObject`. We will add more functionality it later.

## Creating the style and the view.

In order to visualize it, you have to create 2 classes.

- `PointRenderStyle`, which is the parameters for visualization and should be extended from `CommonRenderStyle`.
- `PointView`, which is the view itself, and should be extended from `GroupThreeView`.

Put some fields into the `PointRenderStyle`: `radius`, `opacity`. You may add others later. Note that the radius is a part of the style rather than the data. This is because a specific radius is just one way of showing the point. The data is the point in (x, y, z) coordinates itself.

In the `PointView`, you can relay a lot of the the default implementation in `GroupThreeView`, but you have to create the visualization code yourself. This is done in the `addChildren` method. Here we add Three.js objects to the view. For those who are not familiar with Three.js, here is a suggested implementation:

It is also nice to add a convenience property to the view for reuse:

```typescript

  protected override get style(): PointRenderStyle {
    return super.style as PointRenderStyle;
  }

  protected override addChildren(): void {
    const { domainObject, style } = this;

    const geometry = new SphereGeometry(style.radius, 32, 16);
    const material = new MeshPhongMaterial({
      color: domainObject.color,
      emissive: WHITE_COLOR,
      emissiveIntensity: domainObject.isSelected ? 0.4 : 0.0,
      shininess: 5,
      opacity: style.opacity,
      transparent: true,
      depthTest: style.depthTest
    });
    const sphere = new Mesh(geometry, material);
    const center = domainObject.center.clone();
    center.applyMatrix4(CDF_TO_VIEWER_TRANSFORMATION);
    sphere.position.copy(center);
    this.addChild(sphere);
}
```

You may also override `intersectIfCloser` and `calculateBoundingBox`, but the base class uses the objects created by `addChildren` for the default implementation. But `intersectIfCloser` should often be overridden due to sloppy intersection algorithms in `Three.js` or if you for instance has labels which is not part of the 3D object itself.

Then you have to tell the `PointDomainObject` which view and render style it should use. The you go back the the domain object implementation and override two methods, `createRenderStyle` and `createThreeView`.

> **&#9432; Try it out:** At this moment you should be able to compile all 3 classes, `PointDomainObject`, `PointRenderStyle`and `PointView`.

## Create the tool

Here you implement the user interaction in the 3D viewer. Make a class called `PointTool` or something similar. The best is inherit from `NavigationTool`, which is the tool for all types of navigation. By doing this you will be able to navigate and manipulate the Point without going in and out of the `PointTool`.

The framework let you only have one tool active at the same time. The default tool is `NavigateTool`, which is the basic camera navigation. By clicking at your `PointTool`, this will be active and the `NavigateTool` will be deactivated. You can have as many tools as you like.

First you have to override 2 functions to get the tooltip and the icon on the button. Look in `BaseCommand` for `get icon` and `get tooltip`. `BaseCommand` is the base class of all the command and tools and let you override methods to be used by React. The tooltip should return a `TranslationInput`, which is ready for translation, but you do not need translation for this, so set 'untranslated' only.

Then you have to make some functionality. The simplest I can think about is to create your
`PointDomainObject` by clicking at something. Lets do that by overriding `onClick`.

Here is the implementation. First find the intersection point, if not, use the default implementation,
then get the center of your point in CDF coordinates and create your domain object. Add it to the root and set it visible.

```typescript
  public override async onClick(event: PointerEvent): Promise<void> {
    const intersection = await this.getIntersection(event);
    if (intersection === undefined) {
      await super.onClick(event);
      return;
    }
    const center = intersection.point.clone();
    const matrix = CDF_TO_VIEWER_TRANSFORMATION.clone().invert();
    center.applyMatrix4(matrix);

    const domainObject = new PointDomainObject();
    domainObject.center.copy(center);

    this.rootDomainObject.addChildInteractive(domainObject);
    domainObject.setVisibleInteractive(true, this.renderTarget);
  }
```

Note the method with suffix `Interactive`. These belong to a family of methods which is guarantee to update all necessary dependencies, including the user interface. They have according none interactive functions, which does, and are used to do things in batch and update in the end.

We have also methods ending up with suffix `Core`. These are protected virtual method called by the
framework and should never been used directly. These rules make it easier to understand the code.

Now, you could done this by Reveals `on('click',...)` functionality. In the following we will work more with the tool to make it like production quality.

> **&#9432; Try it out:** At this moment you should be able to compile all 4 classes, `PointDomainObject`, `PointRenderStyle`, `PointView` and `PointTool`.

## Run your application

The only thing you need now it to tell the framework about your new tool. Go to the file `StoryBookConfig`. This file tells the framework how your application should to be. In `createMainToolbar` add your tool.

> **&#9432; Try it out:** Compile and run. If everything works now, you will see your tool in the toolbar. Click on it to activate the tool. Click around in the viewer to create domain objects.

Reveal itself is aware your domain object. To check that Reveal understand your new domain object you can take a quick check.

> **&#9432; Try it out:** Make some points and deactivate your tool by unchecking it. Double click in one point. The camera should set the point in the middle of the screen and set the pivot point in the center (pivot point is center of rotation). Single click and the pivot point will be at the sphere of the point. This is according to the the camera behavior for the CAD model.

## Implement selection functionality

Instead of inherit from `NavigationTool` you should now inherit from `BaseEditTool`. This is also subclass of `NavigationTool`, but add some more functionality to the tool. To see how, do:

Override the method `canBeSelected()` to return true when it is a `PointDomainObject` by using `instanceof`.

Then, in your `onClick` method add this after the first if statement is done:

```typescript
{
  const domainObject = this.getIntersectedSelectableDomainObject(intersection);
  if (domainObject !== undefined) {
    this.deselectAll(domainObject);
    domainObject.setSelectedInteractive(true);
    return;
  }
}
```

Note the method `deselectAll`, it deselected everything except the domainObject. `setSelectedInteractive` doesn't do anything updating if it is selected from before.

There are now two things missing. You have to selected the domain object after it is created and before it is set visible. Also deselected the others.

The second thing you have to implement is in the view. You need to override the method `update`, so it listen to selected change. When this change appears, the children of the view is removed, the bounding box and the render target is invalidated. The last one request a redraw in Reveal.

```typescript
  public override update(change: DomainObjectChange): void {
    super.update(change);
    if (change.isChanged(Changes.selected)) {
      this.clearMemory();
      this.invalidateRenderTarget();
    }
  }
```

When we already do this, also add `Changes.renderStyle`, `Changes.color` and `Changes.geometry` since we need this changes later. The method `isChanged` takes multiple arguments.

Note that we clear the memory when it change. This is a convenient method to remove all redundant data. The next time some of the data is needed, it will be generated automatically (lazy creation). The method `addChildren` will automatically be run when needed.

For large objects, where `addChildren` takes more time, you cannot do this. For instance, when the color change, you only need to update the material. If the geometry change, you need to update the geometry only. If the geometry is large, you can specify which part of geometry you need to update. This is not implemented yet, since we haven't seen any use cases for this, but is a part of this architecture.

> **&#9432; Try it out:** Check that the selection is working when clicking at the your objects. Also check that the object is selected when it is created.

## Implement context dependent cursor

Professional applications uses a context dependent cursor. To do this override `onHoverByDebounce`. This will have 3 states, one for picking on a `PointDomainObject`, one for picking on any other object, and one for nothing.

```typescript
  public override async onHoverByDebounce(event: PointerEvent): Promise<void> {
    const intersection = await this.getIntersection(event);
    // Just set the cursor
    if (this.getIntersectedSelectableDomainObject(intersection) !== undefined) {
      this.renderTarget.setDefaultCursor();
    } else if (intersection !== undefined) {
      this.renderTarget.setCrosshairCursor();
    } else {
      this.renderTarget.setNavigateCursor();
    }
  }
```

> **&#9432; Try it out:** Test that the cursor change when hovering.

## Implement delete functionality

To do this you override `onDeleteKey()`. Here is the skeleton of the method show. Fill in the rest by get the selected and remove it.

```typescript
  public override onDeleteKey(): void {
    const domainObject = this.getSelected();
    // Fill inn the rest
  }
```

> **&#9432; Try it out:** Test that you can delete the points.

## Implement user information for the selected object

This is a attempt to generalizing the card/panel concept. A panel shows some information about the selected object. It is limited, but is a good beginning, but misses some work when it comes to translation and strings. More features will be added later. First you have to tell the framework that this domain object can generate a card (or panel). Do this by:

```typescript
  public override get hasPanelInfo(): boolean {
    return true;
  }
```

The next method generate the info for the panel. Note that the key is the translation key and there should be a translation for that key. But in the exercise we don't care, and can be anything.

```typescript
public override getPanelInfo(): PanelInfo | undefined {
    const info = new PanelInfo();
    info.setHeader(this.typeName);
    add({ key: 'X:COORDINATE' }, this.center.x, Quantity.Length);
    // Fill in rest here like Y, Z and length to origin for instance
    return info;

    function add(translationInput: TranslationInput, value: number, quantity: Quantity): void {
      info.add({ translationInput, value, quantity });
    }
  }
```

Override this method to place the panel where you like

```typescript
  public override getPanelInfoStyle(): PopupStyle {
    return new PopupStyle({ bottom: 0, left: 0 }); // Here: Left-bottom corner
  }
```

> **&#9432; Try it out:** Compile and run. Check that the panel is visualized automatically. Try the button in the panel.

> **&#9432; Try it out:** Also, click at the `m/ft` button on the main toolbar and notice the change.

## Example of the power of virtual methods in this framework

Now you should override one method in your domain object: `canBeRemoved`. This returns true in the default implementation. In the your override is should return false.

> **&#9432; Try it out:** Use the Delete key and check the panel. You shouldn't have any possibility to delete the point. The delete button in the panel should be invisible.

## Dragging

In order to be able to move the point around, you have to implement a dragger. This tells the framework how it should move with the mouse. You should make an object called `PointDragger` which should extend `BaseDragger`. The constructor give you some information when the dragger is starting. The method on `onPointerDrag` should do the dragging itself.

In this example we need:

- The domain object we like to drag
- A copy of the center at drag start
- The plane perpendicular on the mouse direction through the center at drag start
- And a offset to correction for hitting the sphere other places than in the center

When we drag, we simple intersection the plane with the new ray and move the center to this intersection. To be accurate we take the offset correction into account.

I give the code here, since it will take some time to figure this out. You can experiment for instance to constrain it to the horizontal plane only. Note that the input to the dragger in in CDF coordinates, not in viewer coordinates.

```typescript
export class PointDragger extends BaseDragger {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  private readonly _domainObject: ExampleDomainObject;
  private readonly _center: Vector3;
  private readonly _plane: Plane;
  private readonly _offset: Vector3; // Correction for picking the sphere other places than in the center

  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  public constructor(props: CreateDraggerProps, domainObject: PointDomainObject) {
    super(props, domainObject);
    this._domainObject = domainObject;
    this._center = this._domainObject.center.clone();
    this._plane = new Plane().setFromNormalAndCoplanarPoint(this.ray.direction, this._center);

    // This is the correction for picking at the sphere other places than in the center
    const planeIntersection = this.ray.intersectPlane(this._plane, new Vector3());
    if (planeIntersection === null) {
      throw new Error('Failed to intersect plane');
    }
    this._offset = planeIntersection.sub(this._center);
  }

  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get domainObject(): VisualDomainObject {
    return this._domainObject;
  }

  public override onPointerDrag(_event: PointerEvent, ray: Ray): boolean {
    const planeIntersection = ray.intersectPlane(this._plane, new Vector3());
    if (planeIntersection === null) {
      return false;
    }
    planeIntersection.sub(this._offset);
    if (planeIntersection.equals(this._center)) {
      return false; // No change
    }
    if (this.transaction === undefined) {
      this.transaction = this._domainObject.createTransaction(Changes.geometry);
    }
    this._domainObject.center.copy(planeIntersection);
    this.domainObject.notify(Changes.dragging);

    return true;
  }
}
```

You have to tell the `PointDomainObject` to use this dragger. Then override `createDragger` from `VisualDomainObject`. The framework (here the `BaseEditTool`) will automatically create the dragger for you when the mouse start dragging.

> **&#9432; Try it out:** Compile this code. Are you able to move the points?

When this is done, only one thing is missing. You have to indicate in `onHoverByDebounce` the the point can be moved. Change from `setDefaultCursor` or `setMoveCursor`. You must also `setMoveCursor` in the end of `onClick` since `onHoverByDebounce` is not called before you release and move the mouse.

> **&#9432; Try it out:** Do you see the move cursor?

## Playing with the color and the render style

If the mouse is below the selected domain object, you can try to use the mouse wheel to do some changes.
First you have to add this convenience property to the `PointDomainObject`:

```typescript
  public get renderStyle(): PointRenderStyle {
    return super.getRenderStyle() as PointRenderStyle;
  }
```

Then you must override the onWheel. Here is the implementation:

```typescript
  public override async onWheel(event: WheelEvent, delta: number): Promise<void> {
    const intersection = await this.getIntersection(event);
    const domainObject = this.getIntersectedSelectableDomainObject(intersection) as PointDomainObject;
    if (domainObject === undefined || !domainObject.isSelected) {
      await super.onWheel(event, number);
      return;
    }
    // Change radius
      this.addTransaction(domainObject.createTransaction(Changes.renderStyle));

      const factor = 1 - Math.sign(delta) * 0.1;
      domainObject.renderStyle.radius *= factor;
      domainObject.notify(new DomainObjectChange(Changes.renderStyle, 'radius'));
  }
```

And you can even to some more playing by using this code:

```typescript
// Change color
this.addTransaction(domainObject.createTransaction(Changes.color));

let hsl: HSL = { h: 0, s: 0, l: 0 };
hsl = domainObject.color.getHSL(hsl);
hsl.h = (hsl.h + Math.sign(delta) * 0.02) % 1;
domainObject.color.setHSL(hsl.h, hsl.s, hsl.l);
domainObject.notify(Changes.color);
```

```typescript
// Change opacity
this.addTransaction(domainObject.createTransaction(Changes.renderStyle));

const opacity = domainObject.renderStyle.opacity + Math.sign(delta) * 0.05;
domainObject.renderStyle.opacity = clamp(opacity, 0.2, 1);
domainObject.notify(new DomainObjectChange(Changes.renderStyle, 'opacity'));
```

You can bind the the different changes to shift and control key to make it flexible:

```typescript
if (event.shiftKey) {
  //..... paste code here
} else if (event.ctrlKey || event.metaKey) {
  // .... paste code here
} else {
  // .... paste code here
}
```

> **&#9432; Try it out:** Compile your code. Try using the scroll button to change radius, color and opacity. What happens when the mouse is not over any of the points?

## Creating commands

Commands is typically are user interactions outside the viewer. When working on commands, it is often need for traversing the rootDomainObject. In the `DomainObject` you will find some families of convenience methods for this. These are:

- `getChild*(...)` Methods for getting a specific child
- `get[ThisAnd]Descendants*(...)` Methods for iterating on a specific descendants
- `getDescendantBy*(...)` Methods for getting a specific descendant
- `get[ThisAnd]Ancestors*(...)` Methods for iterating on a specific ancestors
- `get[ThisAnd]AncestorBy*(...)` Methods for getting a specific ancestor

By using these function, you can get access to all domain objects you need.

First you should implement a command that reset the render style for all your points.
Here is the code you can start with:

```typescript
export class ResetAllPointsCommand extends RenderTargetCommand {
  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get tooltip(): TranslationInput {
    return { untranslated: 'Reset the visual style in all points' };
  }

  public override get icon(): IconName {
    return 'ClearAllIcon';
  }

  protected override invokeCore(): boolean {
    for (const domainObject of this.rootDomainObject.getDescendantsByType(PointDomainObject)) {
      domainObject.setRenderStyle(undefined);
      domainObject.notify(Changes.renderStyle);
    }
    return true; // Indicate success
  }
```

Please implement `get isEnabled()` so the button is not enable if you don't have any `PointDomainObjects` in the system.

Make a similar `DeleteAllPointsCommand`. When deleting object by a collection, it is often good to convert it to array first, so the iterator works properly.
I have done it in this way (maybe it can be done simpler?)

```typescript
  const array = Array.from(.....)
    for (const domainObject of array)
      // Remove the domainObject here
```

Also, this button must be of type `'ghost-destructive'` so you have to override `get buttonType()`. Use the `'Delete'` icon.

In order to show your commands in the user interface, you have to override the `getToolbar()` method in `PointTool`.

```typescript
public override getToolbar(): Array<BaseCommand | undefined> {
  return [
    new ResetAllPointsCommand(),
    new DeleteAllPointsCommand(),
  ];
}
```

> **&#9432; Try it out:** Activate your tool and notice the toolbar after you have created some domain objects. Test them.

In the architecture there are base class for command operating on a set of similar `DomainObjects`.
This is called `InstanceCommand` and can be used to implement both `ResetAllPointsCommand` and `DeleteAllPointsCommand` to avoid repetitive code. When using this you have to
override:

```typescript
  protected override isInstance(domainObject: DomainObject): boolean {
    return domainObject instanceof PointDomainObject;
  }
```

You can the use `this.getInstances()` and `this.getFirstInstance()` to filter out domainObject for the operation.

Now you are now ready to make a `ShowAllPointCommand` . Inherit from `InstanceCommand`. This should hide all point if they are shown and show them if the are hidden. To determine if they are visible or hidden, you can for instance do this:

```typescript
  private isAnyVisible(): boolean {
    for (const descendant of this.getInstances()) {
      if (descendant.isVisible(this.renderTarget)) {
        return true;
      }
    }
    return false;
  }
```

This should also implement the `get isChecked` method. This can be done simpler, see section **Using a folder** below.

Add it to the list in `getToolbar()` and test it.

> **&#9432; Try it out:** Create some points and toggle the visible button.

## The final touch - manipulate the DepthTest

Here you should try another feature that is in the architecture. Override the method `useDepthTest` in the `PointView`.
Let it return true only if `depthTest` in the style is true. The default implementation returns true.

We should now investigate how the mouse picking responds on this. Keep in mind that the general intersection is implemented in Reveal, not in this framework!

You can reuse a class, `ShowDomainObjectsOnTopCommand` (open the source code for this), to toggle the `depthTest` on all `PointDomainObject`s.
In order get the current value of the `depthTest`, it simply take the first visible it can find. This is done in the `getDepthTest()`.
Create a file and copy this code.

```typescript
export class ShowExamplesOnTopCommand extends ShowDomainObjectsOnTopCommand {
  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get tooltip(): TranslationInput {
    return { untranslated: 'Show all examples on top' };
  }

  protected override isInstance(domainObject: DomainObject): boolean {
    return domainObject instanceof ExampleDomainObject;
  }
```

Finally add `ShowPointsOnTopCommand` to the list in `getToolbar()` in the `PointTool`.

> **&#9432; Try it out:** Create some point. Rotate the model so some points are hidden. Then check this command. Notice that the points are floating over the model. Click and double click to check the response. Uncheck it and do the same.

## Clean code?

Lets check if your code is clean when it comes to dependencies. Ask yourself:

1. How many references do I have to the `PointDragger`.
2. How many references do I have to the `PointView`.
3. How many references do I have from files in the directory I work in to the rest of the system. Please count them.

> &#9432; If you have done all exercises until now you are finished. You are now able to use this architecture and hopefully get some good ideas to use similar architecture elsewhere.

# More advanced exercises

## Using a folder

Now all the `PointDomainObject` are located just below the root. You can make a domain object called `PointFolder`, it can be named `PointFolderDomainObject`, but as a convention, folders is a sort of domain that contains others.

`PointFolder` will inherit directly from `DomainObject` since it don't have a view.

You can then move the `createRenderStyle` to the `PointFolder`, and override `renderStyleRoot` in `PointDomainObject` to get so it return its parent, and finally override `isRenderStyleRoot` in the `PointFolder`. Then you will have only one `RenderStyle` for all `PointDomainObject`.

You must also change the:

```typescript
this.rootDomainObject.addChildInteractive(domainObject);
```

to:

```typescript
let folder = this.rootDomainObject.getDescendantByType(PointFolder);
if (folder === undefined) {
  // Create the folder if it doesn't exist
  folder = new PointFolder();
  this.rootDomainObject.addChildInteractive(folder);
}
folder.addChildInteractive(domainObject);
```

The rest of the code should work without any change.

Now you can use `PointFolder.setVisibleInteractive`, to toggle visibility at all `PointDomainObject`s. To get the visible state for all the domain object in the folder, you can use the method `getVisibleState()`. This function works recursively and will normally return one of `All`, `Some`, `None` or `Disabled`.

## One domain object for all the points

This is more challenging, but should be done if number of points typically is large.

- You must implement your selection mechanism yourself in the domain object by for instance keep the index of the selected point or a list if multi selection is allowed.
- You have to do changes in the tool.
- The view should show all points, in addition the selected point different then the other.
- In the view the `intersectIfCloser` should be override so the index of your point should
  be return with the `CustomObjectIntersection`. You can use the field `userData` to have the index
  of the closest intersected point.
- None of this is particularly hard in this architecture.
- This is done in `AnnotationsDomainObject` (3D annotations)

## Focus on hover

Focus is when you mark the object behind the mouse when hover. You can easily create a focus mechanism. See how this is done the the `MeasureLineDomainObject` (simple) or `MeasureBoxDomainObject` (more advance hover where hover is dependent on where on the box the mouse hover on).

## Multi selection

Normally in other application you can expand or turn off selection with the control key. This should also work well in this framework. You will need to do some minor adjustments in the `PointTool` code, for instance check the `event.ctrlKey` in the `onClick` method.
The panel is implemented so it shows the last selected regardless of how many object you have selected.

You must also use the `BaseEditTool.getAllSelected` instead of the `BaseEditTool.getSelected`.
