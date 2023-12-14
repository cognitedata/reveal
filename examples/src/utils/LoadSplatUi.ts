import * as THREE from 'three';
import { 
	BufferGeometry,
	BufferAttribute,
	InstancedBufferAttribute,
	InstancedBufferGeometry,
	InterleavedBufferAttribute
} from 'three';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';
import dat from 'dat.gui';
import { Cognite3DViewer } from '@cognite/reveal';
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader.js';

class SplatBuffers {
	public positionattribute: InstancedBufferAttribute;
	public colorattribute:InstancedBufferAttribute;
	public rotationattribute: InstancedBufferAttribute;
	public scaleattribute: InstancedBufferAttribute;
	public opacityattribute: InstancedBufferAttribute;

	public positionattribute_tmp: BufferAttribute;
	public colorattribute_tmp: BufferAttribute;
	public scaleattribute_tmp: BufferAttribute;
	public rotationattribute_tmp: BufferAttribute;
	public opacityattribute_tmp: BufferAttribute;
	
	public numInstances: number = 0;
	
	constructor(plygeometry : BufferGeometry) {
        
		this.positionattribute_tmp = plygeometry.getAttribute('position') as BufferAttribute;
		this.colorattribute_tmp = plygeometry.getAttribute('splatcolor') as BufferAttribute;
		this.scaleattribute_tmp = plygeometry.getAttribute('splatscale') as BufferAttribute;
		this.rotationattribute_tmp = plygeometry.getAttribute('splatrotation') as BufferAttribute;
		this.opacityattribute_tmp = plygeometry.getAttribute('splatopacity') as BufferAttribute;
		
		this.numInstances = this.positionattribute_tmp.count;
		
		this.colorattribute = new THREE.InstancedBufferAttribute(new Float32Array(this.numInstances * 3), 3);
		this.scaleattribute = new THREE.InstancedBufferAttribute(new Float32Array(this.numInstances * 3), 3);
		this.rotationattribute = new THREE.InstancedBufferAttribute(new Float32Array(this.numInstances * 4), 4);
		this.positionattribute = new THREE.InstancedBufferAttribute(new Float32Array(this.numInstances * 3), 3);
		this.opacityattribute = new THREE.InstancedBufferAttribute(new Float32Array(this.numInstances), 1); 
    }
	
	public updateSplatSorting(camera : any)
	{
		const positions = this.positionattribute_tmp.array;
		const squared_distances = [];
		
		let V = new THREE.Vector3();
		for (let i = 0; i < positions.length; i += 3)
		{
			squared_distances.push(-V.set(positions[i + 0], positions[i + 1], positions[i + 2]).sub(camera.position).lengthSq()); // squared length of V = (splat.position - camera.position)
		}
		function argsort(arr : any) { return (Array.from(arr.keys())as number[]).sort((a : number, b : number) => arr[a] - arr[b]); }
		const sortedIndices = argsort(squared_distances);
		
		const SH_C0 = 0.28209479177387814;
		for (let i:number = 0; i < this.numInstances; i++)
		{	
			const j : number = sortedIndices[i];
			this.colorattribute.setXYZ(i, 
				0.5 + SH_C0 * this.colorattribute_tmp.getX(j),
				0.5 + SH_C0 * this.colorattribute_tmp.getY(j),
				0.5 + SH_C0 * this.colorattribute_tmp.getZ(j));
				
			this.scaleattribute.setXYZ(i, 
				Math.exp(this.scaleattribute_tmp.getX(j)),
				Math.exp(this.scaleattribute_tmp.getY(j)),
				Math.exp(this.scaleattribute_tmp.getZ(j))
				);
			
			let qx = this.rotationattribute_tmp.getY(j); // NOTE ORDER!
			let qy = this.rotationattribute_tmp.getZ(j); // NOTE ORDER!
			let qz = this.rotationattribute_tmp.getW(j); // NOTE ORDER!
			let qw = this.rotationattribute_tmp.getX(j); // NOTE ORDER!
			const norm = Math.sqrt(qx*qx + qy*qy + qz*qz + qw*qw);
			this.rotationattribute.setXYZW(i, qx/norm, qy/norm, qz/norm, qw/norm);
			this.positionattribute.setXYZ(i,
				this.positionattribute_tmp.getX(j), 
				this.positionattribute_tmp.getY(j),
				this.positionattribute_tmp.getZ(j));
			this.opacityattribute.setX(i, (1. / (1. + Math.exp(-this.opacityattribute_tmp.getX(j)))));
		}
		
		this.colorattribute.needsUpdate = 
		this.scaleattribute.needsUpdate = 
		this.rotationattribute.needsUpdate = 
		this.positionattribute.needsUpdate = 
		this.opacityattribute.needsUpdate = true;
	}
}

export class LoadSplatUi {
  private readonly _viewer: Cognite3DViewer;
  private readonly _params = {
    url: ''
  };

  private splatBuffers: SplatBuffers | null = null;

  constructor(uiFolder: dat.GUI, viewer: Cognite3DViewer) {
    this._viewer = viewer;
    this.createGui(uiFolder);
  }

  private createGui(ui: dat.GUI): void {
    const actions = {
      loadSplat: () => this.loadSplat(this._params.url),
	  sortSplat: () => this.sortSplats(),
    };
    ui.add(this._params, 'url').name('URL');
    ui.add(actions, 'loadSplat').name('Load Splat');
	ui.add(actions, 'sortSplat').name('Sort splats');
  }

  private loadSplat(url: string): void {
	
	const loader = new PLYLoader(); 
	loader.setCustomPropertyNameMapping( {
		splatcolor: ['f_dc_0', 'f_dc_1', 'f_dc_2'],
		splatscale: ['scale_0', 'scale_1', 'scale_2'],
		splatrotation: ['rot_0', 'rot_1', 'rot_2', 'rot_3'],
		splatopacity: ['opacity']
	 } );  
	  
    
	url = '/point_cloud.ply';
    loader.load(
      url,
      plygeometry => this.addSplatToViewer(plygeometry),
      event => console.log(`Loading Splat: ${event.loaded}/${event.total}`)
    );
  }
  
  private sortSplats()
  {
	  if(this.splatBuffers)
	  {
		  const camera : any = this._viewer.cameraManager.getCamera();
		  this.splatBuffers.updateSplatSorting(camera);
	  }
  }

  private addSplatToViewer(this: LoadSplatUi, plygeometry : BufferGeometry): void {
	  
	let planegeo = new THREE.PlaneGeometry(1,1);
	planegeo.setIndex([0, 1, 2, 1, 2, 3]);
	const positions = new THREE.BufferAttribute(new Float32Array(4 * 3), 3);
	for(let i = 0; i < 4; i++) positions.setXYZ(i, 2.*(i%2)-1., 2.*Math.floor(i/2)-1., 0.); // set vertex positions to square with x and y = +/- 1. and z = 0.
	planegeo.setAttribute('position', positions);

	const vertexShaderString = 
	`
	attribute vec3 splatmean;
	attribute vec3 splatcolor;
	attribute vec3 splatscale;
	attribute vec4 splatrotation;
	attribute float splatopacity;

	out vec3 vColor;
	out vec2 vPosition;
	out vec2 vUV;
	out float opacity;

	uniform vec2 iResolution;

	const float PI = 3.14159265;

	mat3 quat_to_mat(vec4 q)
	{
		float qi2 = q.x*q.x;
		float qj2 = q.y*q.y;
		float qk2 = q.z*q.z;
		
		float qij = q.x*q.y;
		float qik = q.x*q.z;
		float qjk = q.y*q.z;
		
		float qir = q.x*q.w;
		float qjr = q.y*q.w;
		float qkr = q.z*q.w;
		
		return 
			mat3(1) +
			2. * mat3(
				vec3(-qj2 - qk2,  qij + qkr,  qik - qjr),
				vec3( qij - qkr, -qi2 - qk2,  qjk + qir),
				vec3( qik + qjr,  qjk - qir, -qi2 -qj2)
			); 
	}

	mat3 Jacobian(vec3 t_k, vec2 focal_xy)
	{
		vec3 last_row = t_k / length(t_k);
		
		float w = -t_k.z;
		
		vec2 tan_fov_xy = vec2(1./focal_xy);
		vec2 lim = vec2(tan_fov_xy) * 1.3;
		vec2 t = clamp(t_k.xy / w, -lim, lim) * w;
		
		mat3 J = mat3
		(
			1./w, 0.,                 last_row.x,
			0., 1./w,                 last_row.y,
			(t.x)/(w*w), (t.y)/(w*w), last_row.z
		);
		
		return J;
	}

	struct Quad
	{
		vec3 v00, v01, v10, v11;
	};

	vec4 splatQuad(vec3 splat_center_camera, vec3 scale, mat3 Camera_Rotation, vec2 focal_xy)
	{
		mat3 W = transpose(Camera_Rotation);

		mat3 J = Jacobian(splat_center_camera, focal_xy);    
			
		mat3 S = mat3(scale.x,0,0, 0,scale.y,0, 0,0,scale.z);
		mat3 JWS = J * W * S;
		mat3 transJWS = transpose(JWS);
		
		mat2x3 transJWS2 = mat2x3(transJWS[0], transJWS[1]);
		
		mat3x2 JWS2 = transpose(transJWS2);
		
		mat2 Cov = JWS2 * transJWS2;
			
		float pix_size = (2. / iResolution.y) / focal_xy.y;
		Cov[0][0] += .3 * pix_size * pix_size;
		Cov[1][1] += .3 * pix_size * pix_size;
			
		float m = (Cov[0][0] + Cov[1][1]) * .5;
		float dt = determinant(Cov);
		
		float discr = sqrt(m*m - dt);
		float l1 = m + discr;
		float l2 = m - discr;
		
		vec2 v1 = PI * sqrt(l1) * normalize(vec2(-1,1) * Cov[0].yx - vec2(0,l1));
		vec2 v2 = PI * sqrt(l2) * normalize(vec2(-1,1) * Cov[0].yx - vec2(0,l2));
		
		vec4 quad = vec4(v1, v2);

		return quad;
	}

	void main()
	{
		mat3 rotation = transpose(quat_to_mat(splatrotation));

		mat4 viewMatrix = modelViewMatrix;

		mat3 Camera_Rotation = mat3(viewMatrix[0].xyz, viewMatrix[1].xyz, viewMatrix[2].xyz);
		vec3 view_pos = cameraPosition;
		mat3 R = rotation * transpose(Camera_Rotation);
		vec3 splat_center_camera = Camera_Rotation * (splatmean - view_pos);

		vec2 focal_xy = vec2(projectionMatrix[0][0], projectionMatrix[1][1]);
		vec4 quad = splatQuad(splat_center_camera, splatscale, R, focal_xy);

		vec2 offset = position.x * quad.xy + position.y * quad.zw;
		offset.xy *= abs(splat_center_camera.z);

		vec4 outposition = vec4(splat_center_camera, 1.);
		outposition.xy += offset;
		
		gl_Position = projectionMatrix * outposition;
		vPosition = position.xy;
		vColor = splatcolor;
		vUV = uv;
		opacity = splatopacity;
	}`;
	const fragmentShaderString =
	`
	in vec3 vColor;
	in vec2 vPosition;
	in vec2 vUV;
	in float opacity;
	const float PI = 3.14159265;
	void main()
	{
		vec2 centered = vPosition;
		float rcp_sigma = PI;
		vec2 x = centered * rcp_sigma;
		float gaussian = exp(-.5*dot(x, x));
		float alpha = min(opacity * gaussian, 0.99);
		
		if(alpha < 1. / 255.)
			discard;
		gl_FragColor = vec4(vColor, alpha);
	}`;

	let uniforms = { iResolution:  {value : new THREE.Vector2(
		1920, 1080
		//window.innerWidth, window.innerHeight
		)} };

	let shaderMaterial = new THREE.ShaderMaterial(
	{	
			side : THREE.DoubleSide, // required since vertices somethimes flip, atm
			uniforms: uniforms,
			vertexShader : vertexShaderString,
			fragmentShader : fragmentShaderString,
			blending : THREE.CustomBlending,
			blendEquation : THREE.AddEquation,
			blendSrc : THREE.SrcAlphaFactor,
			blendDst : THREE.OneMinusSrcAlphaFactor,
			blendSrcAlpha: THREE.OneMinusDstAlphaFactor,
			blendDstAlpha: THREE.OneFactor,
			depthTest: false,
			transparent:true,
			vertexColors:true,
	});

	this.splatBuffers = new SplatBuffers(plygeometry);
	
	function updateSplatSorting(splatBuffers: SplatBuffers, camera : any)
	{
		const positions = splatBuffers.positionattribute_tmp.array;
		const squared_distances = [];
		
		let V = new THREE.Vector3();
		for (let i = 0; i < positions.length; i += 3)
		{
			squared_distances.push(-V.set(positions[i + 0], positions[i + 1], positions[i + 2]).sub(camera.position).lengthSq()); // squared length of V = (splat.position - camera.position)
		}
		function argsort(arr : any) { return (Array.from(arr.keys())as number[]).sort((a : number, b : number) => arr[a] - arr[b]); }
		const sortedIndices = argsort(squared_distances);
		
		const SH_C0 = 0.28209479177387814;
		for (let i:number = 0; i < splatBuffers.numInstances; i++)
		{	
			const j : number = sortedIndices[i];
			splatBuffers.colorattribute.setXYZ(i, 
				0.5 + SH_C0 * splatBuffers.colorattribute_tmp.getX(j),
				0.5 + SH_C0 * splatBuffers.colorattribute_tmp.getY(j),
				0.5 + SH_C0 * splatBuffers.colorattribute_tmp.getZ(j));
				
			splatBuffers.scaleattribute.setXYZ(i, 
				Math.exp(splatBuffers.scaleattribute_tmp.getX(j)),
				Math.exp(splatBuffers.scaleattribute_tmp.getY(j)),
				Math.exp(splatBuffers.scaleattribute_tmp.getZ(j))
				);
			
			let qx = splatBuffers.rotationattribute_tmp.getY(j); // NOTE ORDER!
			let qy = splatBuffers.rotationattribute_tmp.getZ(j); // NOTE ORDER!
			let qz = splatBuffers.rotationattribute_tmp.getW(j); // NOTE ORDER!
			let qw = splatBuffers.rotationattribute_tmp.getX(j); // NOTE ORDER!
			const norm = Math.sqrt(qx*qx + qy*qy + qz*qz + qw*qw);
			splatBuffers.rotationattribute.setXYZW(i, qx/norm, qy/norm, qz/norm, qw/norm);
			splatBuffers.positionattribute.setXYZ(i,
				splatBuffers.positionattribute_tmp.getX(j), 
				splatBuffers.positionattribute_tmp.getY(j),
				splatBuffers.positionattribute_tmp.getZ(j));
			splatBuffers.opacityattribute.setX(i, (1. / (1. + Math.exp(-splatBuffers.opacityattribute_tmp.getX(j)))));
		}
		
		splatBuffers.colorattribute.needsUpdate =
		splatBuffers.scaleattribute.needsUpdate = 
		splatBuffers.rotationattribute.needsUpdate = 
		splatBuffers.positionattribute.needsUpdate = 
		splatBuffers.opacityattribute.needsUpdate = true;
	}

	console.log(this.splatBuffers.numInstances);
	
	const matrix = new THREE.Matrix4();
	const geometry = new THREE.InstancedBufferGeometry(); //colorattribute = new THREE.InstancedBufferAttribute(array : TypedArray, itemSize : Integer, normalized : Boolean, meshPerAttribute : Number);

	{
		const positionsattr = new Float32Array(planegeo.getAttribute('position').array);
		geometry.setAttribute('position', new THREE.BufferAttribute(positionsattr, 3));

		const indices = new Uint32Array(planegeo.getIndex()!.array);
		geometry.setIndex(new THREE.BufferAttribute(indices, 1));
	}

	geometry.setAttribute('splatcolor',this.splatBuffers.colorattribute);
	geometry.setAttribute('splatscale', this.splatBuffers.scaleattribute);
	geometry.setAttribute('splatrotation', this.splatBuffers.rotationattribute);
	geometry.setAttribute('splatmean', this.splatBuffers.positionattribute);
	geometry.setAttribute('splatopacity', this.splatBuffers.opacityattribute);
	
	const camera : any = this._viewer.cameraManager.getCamera();
	updateSplatSorting(this.splatBuffers, camera);
	
	const splat = new THREE.InstancedMesh(geometry, shaderMaterial, this.splatBuffers.numInstances);
	
	const position = new THREE.Vector3();
	for(let i = 0; i < this.splatBuffers.numInstances; i++)
	{		
		position.x = this.splatBuffers.positionattribute_tmp.getX(i);
		position.y = this.splatBuffers.positionattribute_tmp.getY(i);
		position.z = this.splatBuffers.positionattribute_tmp.getZ(i);
		matrix.makeTranslation(position);
		splat.setMatrixAt(i, matrix);
	}
	
    this._viewer.addObject3D(splat);
  }
}
