

private _renderToDepthTexture(
    camera: THREE.PerspectiveCamera | THREE.OrthographicCamera,
    renderer: THREE.WebGLRenderer,
    geometries: THREE.Object3D[]
  ) {
    // copy the world transformation of geometry to scene root
    const geometry0 = geometries[0];
    geometry0.getWorldPosition(worldPosition);
    geometry0.getWorldQuaternion(worldQuaternion);
    geometry0.getWorldScale(worldScale);
    this._depthObjectWrapper.position.copy(worldPosition);
    this._depthObjectWrapper.rotation.setFromQuaternion(worldQuaternion);
    this._depthObjectWrapper.scale.copy(worldScale);

    // add the model to the new object3d object and change material
    geometries.forEach(object => {
      if (!this._objectParentMap.has(object)) {
        this._objectParentMap.set(object, object.parent);
      }
      this._depthObjectWrapper.add(object);
      if (object instanceof THREE.LOD) {
        object.children.forEach(lod => {
          if (lod instanceof CogniteBaseMesh && lod.depthMaterial != null) {
            lod.material = lod.depthMaterial;
          }
        });
      } else if (object instanceof CogniteBaseMesh && object.depthMaterial != null) {
        object.material = object.depthMaterial;
      }
    });

    // do rendering
    const { width, height } = renderer.getSize(new THREE.Vector2());
    this._depthTexture.setSize(width, height);
    renderer.setRenderTarget(this._depthTexture);
    renderer.render(this._depthScene, camera);

    // reset parent and material
    geometries.forEach(object => {
      const parent = this._objectParentMap.get(object);
      if (parent) {
        parent.add(object);
      } else {
        this._depthObjectWrapper.remove(object);
      }
      if (object instanceof THREE.LOD) {
        object.children.forEach(lod => {
          if (lod instanceof CogniteBaseMesh) {
            lod.material = lod.standardMaterial;
          }
        });
      } else if (object instanceof CogniteBaseMesh) {
        object.material = object.standardMaterial;
      }
    });
  }
