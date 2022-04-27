The contents from this folder was taken from `@pnext/three-loader` revision 23c0ad2edb566038791809d03f8c843e246cd949.

A few changes was made on the initial move here - most notably the addition of binary EPT loading capability.

See the LICENSE file for the original license file.

## Glossary

#### Geometry Node

A node that supports loading geometry, without necessarily having the data loaded. The data resides solely on the CPU side.

#### Tree Node

A node wrapping the point data, stored in a THREE.Points object (on the GPU), seems to be assumed rendered in the code.
