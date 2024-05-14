# Building and teesting

Do the following commands:

    yarn
    yarn build
    yarn storybook`

This will automatically goto: https://localhost:3000/?modelUrl=primitivesOpen.

Instead of yarn build, use can build with types by:

    yarn tsc --noEmit

When the StoryBook is open, goto `Architeture/Main`. The toolbar on the right hand side is the one I have made. Here some commands and tools are added.

# Motivation

The objectives with this framework it that is should be easy to use and extend in the future. I hope all new related functiality will be developed using this framework. More is decribed in this document: https://docs.google.com/presentation/d/1Y50PeqoCS5BdWyDqRNNazeISy1SYTcx4QDcjeMKIm78/edit?usp=sharing

# Coding

You will probably find the coding style somewhat different than usually done in Reveal. Some difference:

- **Headers:** Headers are used to mark sections in a file. This is important for fast navigation and to keep the code in correct order. The order in the file is always:

  - Public constants (exported)
  - Instance fields.
  - Instance properties
  - Implementation of interface (if any)
  - Overrides from the must basic base class (if any)
  - :
  - Overrides from the actually base class (if any)
  - Instance methods (If many, break it up based on what they do)
  - Static methods (if any)
  - Local functions, types or classes used in this file only

- **Virual methods:**: Since TypeScript doesn't allow the virtual keyword, all functions are virtual. This is a weekness for the application developer. I have tried to mark function as virtual by comments. You should not override other function than this. A virtual function normally brings in uncessesary complexibility and should general be used by care.

  - Function with prefex `Core` are always virtual and protected. They can be overridden, but must call the same function for the base class. A function without the `Core` prefex is the one you should call from outside and is public. Experince shows that this pattern will make the code easier to maintain and extend in the future. For instance `remove/removeCore` and `initialize/initializeCore` in the `DomainObject`.
  - Overridden methods should alway be marked by the override keyword. You will unfortunate not get any linting error when you forget this.
  -

- **Static methods and classes:** The linker don't like static method, epecially when the entire class have static method only. I wanted to use this more, but have used functions instead. I don't like this, because it doen't group similar function togeter. It will also be less readabble on the caller side, since you don't know what part of the code the function is coming from. In typescript we have for instance Math with act like a static class, but they use som magic to pretend it to be using interface.

- **Reuse:** I try to reuse code whenever it is possible. Therefore you will find functions that are very small,
  often one liners. This ensures the complexity of the code to be low and increase readability on the caller side. For instance:

        export function clear<T>(array: T[]): void {
            array.splice(0, array.length);
        }

- **Single responsibility:** I try to give each class one single responsibility. Therefore I use several base classes, each class adds some complexity.
  Examples of this is `BaseView/ThreeView/GroupThreeView` which are all base classes. If they are merge to one single class, it will be too complex.

- **Interpendence:** Try to keep must classes independed of other classes. For instance the tool should not know abount the views. Utility function and classes can used whenevery you like.

- **Utility function and classes:** I have added som utility function/classes in `architecture/base/utilities`.
  - Some utility functions may be a duplicate of some function in a package we use. Please tell me.
  - Some utility classes you will see is like a duplicate, but is made by purpose. For instance `Range3` class which is almost the same as `THREE.Box`, but is far easier to work with.
  - Some utility classes or function is already implemented in Reveal, and are similar. The reason for not reusing Reveal here is due to what we should expose out of Reveal and into Reveral-components. For the moment this is rather strick. Examples is `Vector3Pool` which is implemented both places. Also some of the color classes may seem to be similar. But all this is low level stuff, and is not related to any Reveal functionallity.
  - I will remove unused utility function or classes when I feel ready for it. Most of them are imported file by file from the node-visualier project.

# Architecture Overview

## architecture/base

Here is the architecture with all base classes and some utility functionality.

### architecture/base/domainObject

- **DomainObject:** This is the base class for the domain object. A domain object is some sort of data, that is a collection of other domainObject or the data itself.

  - An important property of the domainObject is that is has a list of views that will be updated.
  - It has a parent and a collection of children. To ensure easy use, I have added several methods to access children, descendants and ancestors in several ways.

  - It has some properties like selected, expanded and active. This is not used yet, but I wanted it to be here as this is part of the pattern. They are connected to how they are visualized and behave in a tree view, but this is not used for the moment.

  - Methods with postfix `Interactive` are doing all necessary updates automatically. For instance: `addChild/addChildInteractive` or `setVisible/setVisibleInteractive`

- **VisualDomainObject**: This subclass adds functionality to a domain object so it can be shown in 3D. The most important function here is `createThreeView()` which must be overridden.

- **FolderDomainObject**: Concrete class for multi purpose folder.

- **RootDomainObject**: Concrete class for the root of the hierarchy

### architecture/base/renderTarget

Normally, when I follow this pattern, the renderTarget is a domainObject itself, and you can have as many of them as you like. But this makes it a little bit more complicated. Since we always have one viewer only, I don't use any base class for this.

- **RevealRenderTarget** Wrap around the Cognite3DViewer. It contains:

  - The `Cognite3DViewer` and assume this is constructed somewhere else.
  - The `RootDomainObject`, where the data can be added.
  - The `ToolController`, where the active tool is kept and where the events are handled.
  - In addition, it has several utility functions for getting information from the viewer.
  - It set up listeners on `cameraChange` and `beforeSceneRendered` events from the viewer.

- **ToolController**
  Holds the tools and all commands, the active tool and the previous tool.
  - It inherits from `PointerEvents`, which is a base class on the Reveal side. All virtual functions are implemented in the `ToolControllers`.
  - It creates a `PointerEventsTarget`, also on the Reveal side, that set up all the event listeners for the pointer (mouse or touch) handlers. The `PointerEventsTarget` will automatically call the functions `onHover`, `onClick`, `onDoubleClick`, `onPointerDown`, `onPointerUp` and `onPointerDrag` correctly.
  - In addition it sets up some other events like `onKey` and `onFocus`.
  - All event are routed to the active tool

### architecture/base/commands

- **BaseCommand**: Base class for all tools and commands. There are basically user actions. It contains all necessary information to create and update a button in the user interface, but it doesn't need or use React. The must important method to overide is invokeCore, which is called whewn the use press the button.A base commen can be checkable

- **RenderTargetCommand** I wanted BaseCommand should be independent of any type of connection to the rest of the system. This class only brings in the connection to the `RevealRenderTarget`.

- **BaseTool** This is the base class for all the tools, which is used when doing user interaction in the viewer itself. It defined a lot of virtual methods for user interactions. This should be overridden for creating the logic specific for a tool.

### architecture/base/concreteCommands

This is a collection of most commonly used tools and commands:

- **FitViewCommand**: Fit view to the model bounding box
- **NavigationTool**: Reroute the events to the camera manager
- **SetFlexibleControlsTypeCommand**: This is another version than we had before. It is made for testing the architecture where the users are changing the state of the command from outside. Use the "1" or "2" key to change between Fly or Orbit mode.

### architecture/base/views

- **BaseView**: Represents a abstract base view class that provides common functionality for all types of views. This does not have any dependency to three.js and can be used in other types of views as well.

- **ThreeView**: Represents an abstract base class for a Three.js view in the application. It adds basicly 2 things: Concept of bounding box and a pointer to the renderTarget (viewer). The bounding box is a lazy calculation. The reeason for this object is that we sometimes can have a view without any `Object3D`, for instance if a view manipulates another view, for instance a texture on a surface.

- **GroupThreeView**: Represents an abstract base class for a Three.js view where it holds a pointer to a `THREE.Group` object. This object is the root of the `Object3D`'s that can be added to the view. The most important method is a`sddChildren()` to be overridden. Here the children of the group should be added. The class will administrate the group and the children, and perform a lazy creation of these automatically. In the code all views are inherited from `GroupThreeView`.

### architecture/base/domainObjectHelpers

- **RenderStyle**: Is the base class for all renderstyle.

- **Changes**: All changes that can be applied on a domainObject. it uses symbols as the type, because it can easily be extended. It looks like an enum when unit it, since I have used a static class, and this is done by purpose.

- **DomainObjectChange** Here you can add several changes before you call domainObject.notify(....)

### architecture/base/utilities

Smaller files with utility classes and functions:

- **architecture/base/utilities/box:**

  Geometry algorithms and enums for box manipulation.

- **architecture/base/utilities/colors:**

  Color manipulation. Making various colormaps and 1d textures from color maps. Used mostly by the terrain visualization.

- **architecture/base/utilities/extensions:**

  Some simple math and THREE.Vector2/3 extension

- **architecture/base/utilities/geometry:**

  Some usefull geometry

- **architecture/base/utilities/sprites:**

  Easy Creation of sprite with text

# Some concrete examples

These are made to test the architecture but should when ready be used by any of Cognites applications:

## architecture/concrete

### architecture/concrete/axes

- AxisDomainObject, AxisRenderStyle and AxisTreeView
- SetAxisVisibleCommand to set the axis visible

### architecture/concrete/boxDomainObject

- BoxDomainObject, BoxRenderStyle and BoxTreeView
- BotEditTool for manipulation

### architecture/concrete/terrainDomainObject

- TerrainDomainObject, TerrainRenderStyle and TerrainTreeView
- UpdateTerrainCommand and SetTerrainVisibleCommand for demo/example
- geometry: Folder with math and grid structures

```

```
