import * as THREE from 'three';
import { SplatBuffers, SplatSortingWorkerData } from './LoadSplatUi';

import { 
	BufferGeometry,
	BufferAttribute,
	InstancedBufferAttribute,
	InstancedBufferGeometry,
	InterleavedBufferAttribute
} from 'three';

self.onmessage = (event: MessageEvent) => {
	//const inputData = new Float32Array(event.data);
  
	const workerBuffers : SplatSortingWorkerData = event.data;

	if(workerBuffers.data != null)
	{
		// const resultData = processData(workerBuffers.data);
		// Send the result back to the main thread
		
		updateSplatSorting(workerBuffers);
		
		postMessage(
			workerBuffers, 
			{ 
				transfer : [
					workerBuffers.data.buffer,
					
					workerBuffers.colorattribute.buffer,
					workerBuffers.scaleattribute.buffer,
					workerBuffers.rotationattribute.buffer,
					workerBuffers.positionattribute.buffer,
					workerBuffers.opacityattribute.buffer,
					
					workerBuffers.positionattribute_tmp.buffer,
					workerBuffers.colorattribute_tmp.buffer,
					workerBuffers.scaleattribute_tmp.buffer,
					workerBuffers.rotationattribute_tmp.buffer,
					workerBuffers.opacityattribute_tmp.buffer 
				]
			}
		);
	}
};

function updateSplatSorting(workerBuffers : SplatSortingWorkerData)
{
	const positions = workerBuffers.positionattribute_tmp;
	const squared_distances = [];
	
	let V = new THREE.Vector3();
	for (let i = 0; i < positions.length; i += 3)
	{
		V.set(positions[i + 0], positions[i + 1], positions[i + 2]);
		V.applyMatrix3( workerBuffers.iOrientation );
		squared_distances.push(-V.sub(workerBuffers.camera_position).lengthSq()); // squared length of V = (splat.position - camera.position)
	}
	function argsort(arr : any) { return (Array.from(arr.keys())as number[]).sort((a : number, b : number) => arr[a] - arr[b]); }
	const sortedIndices = argsort(squared_distances);
	
	const SH_C0 = 0.28209479177387814;
	for (let i:number = 0; i < workerBuffers.numInstances; i++)
	{	
		const j : number = sortedIndices[i];
		workerBuffers.colorattribute[3*i+0] = 0.5 + SH_C0 * workerBuffers.colorattribute_tmp[3 * j + 0];
		workerBuffers.colorattribute[3*i+1] = 0.5 + SH_C0 * workerBuffers.colorattribute_tmp[3 * j + 1];
		workerBuffers.colorattribute[3*i+2] = 0.5 + SH_C0 * workerBuffers.colorattribute_tmp[3 * j + 2];
			
		workerBuffers.scaleattribute[3*i+0] = Math.exp(workerBuffers.scaleattribute_tmp[3 * j + 0]);
		workerBuffers.scaleattribute[3*i+1] = Math.exp(workerBuffers.scaleattribute_tmp[3 * j + 1]);
		workerBuffers.scaleattribute[3*i+2] = Math.exp(workerBuffers.scaleattribute_tmp[3 * j + 2]);
		
		let qx = workerBuffers.rotationattribute_tmp[4 * j + 1]; // NOTE ORDER!
		let qy = workerBuffers.rotationattribute_tmp[4 * j + 2]; // NOTE ORDER!
		let qz = workerBuffers.rotationattribute_tmp[4 * j + 3]; // NOTE ORDER!
		let qw = workerBuffers.rotationattribute_tmp[4 * j + 0]; // NOTE ORDER!
		const norm = Math.sqrt(qx*qx + qy*qy + qz*qz + qw*qw);
		qx = qx/norm;
		qy = qy/norm;
		qz = qz/norm;
		qw = qw/norm;
		
		workerBuffers.rotationattribute[4*i+0] = qx;
		workerBuffers.rotationattribute[4*i+1] = qy;
		workerBuffers.rotationattribute[4*i+2] = qz;
		workerBuffers.rotationattribute[4*i+3] = qw;
		
		workerBuffers.positionattribute[3*i+0] = workerBuffers.positionattribute_tmp[3 * j + 0];
		workerBuffers.positionattribute[3*i+1] = workerBuffers.positionattribute_tmp[3 * j + 1];
		workerBuffers.positionattribute[3*i+2] = workerBuffers.positionattribute_tmp[3 * j + 2];
		
		workerBuffers.opacityattribute[i] = 1. / (1. + Math.exp(-workerBuffers.opacityattribute_tmp[j]));
	}
}

function sortSplats(positions: Float32Array, iOrientation : THREE.Matrix3, camera_position: THREE.Vector3): void 
{
	//const positions = this.positionattribute_tmp.array;
	const squared_distances = [];
	
	let V = new THREE.Vector3();
	for (let i = 0; i < positions.length; i += 3)
	{
		V.set(positions[i + 0], positions[i + 1], positions[i + 2]);
		V.applyMatrix3( iOrientation );
		squared_distances.push(-V.sub(camera_position).lengthSq()); // squared length of V = (splat.position - camera.position)
	}
	function argsort(arr : any) { return (Array.from(arr.keys())as number[]).sort((a : number, b : number) => arr[a] - arr[b]); }
	const sortedIndices = argsort(squared_distances);
}

function processData(inputData: Float32Array): Float32Array {
	for (let i = 0; i < inputData.length; i++) {
		inputData[i] = inputData[i] + 1;
	}
	return inputData;
}