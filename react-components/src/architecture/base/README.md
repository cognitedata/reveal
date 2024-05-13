#Building

yarn
yarn build
yarn tsc --noEmit // Same as yarn build, but build with types
yarn storybook

This will goto: https://localhost:3000/?modelUrl=primitives
Open Architecture/Main

#Movivation

Go to this document
https://docs.google.com/presentation/d/1Y50PeqoCS5BdWyDqRNNazeISy1SYTcx4QDcjeMKIm78/edit?usp=sharing

#Overview

##architecture/base

Here is the architecture with all base classes and some utility functionallity.

###architecture/base/domainObject

DomainObject: This is the base class for the domain object. A domain object is some sort of data, that is a collection of other domainObject or the data itself. A important property of the domainObject is that is has a list of views that will be updated.

FolderDomainObject: Concrete class and RootDomainObject

###architecture/base/views

BaseView: Represents a abstract base view class that provides common functionality for all types of views. This do not have any dependency to three.js and can be used in other types of views as well.

ThreeView: Represents an abstract base class for a Three.js view in the application. It adds basicly 2 thing: Concept of bounding box and a pointer to the renderTarget (viewer). The bounding box is lazy calculated. The reeason for this object is that we sometimes can have a view without and Object3D, for instance if a view manipulates another view, for instance a texture on a surface.

GroupThreeView: Represents an abstract base class for a Three.js view where it holds a pointer to a Group object. This object is the root of the Object3D's that can be added to the view. The most important method is addChildren() to be overridden. Here the children of the group should be aded. The class will administrate the group and the children, and perform a lazy creation of these automatically.

In the cade all view are inhirited from GroupThreeView.
