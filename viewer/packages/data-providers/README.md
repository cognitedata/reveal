# Data Providers

This package encapsulates the API for retrieving model metadata files and geometry files from Cognite CDF to enable emulation of the API (e.g. for locally hosted models).

## Point Cloud Objects

Point cloud objects can be stored as annotations in CDF. We currently support two shapes which can be union-ed into larger volumes to represent objects: Cylinders and boxes.

**Cylinders** are represented by
- Two points representing the center point of the flat surface at each end of the cylinder (`center_a`, `center_b`)
- A number `radius`, containing the radius

**Boxes** are represented by 16-number arrays. It is the elements of the instance transformation matrix of that box in row-major order. The base (identity) box is the axis-aligned box spanned between (-1, -1, -1), (1, 1, 1).

These shapes are stored in the CDF coordinate system when coming from CDF.
Note that the radius of the cylinder and the size of the box is increased slightly when checking for contained points, for the purpose of actually enclosing all points belonging to the object.
