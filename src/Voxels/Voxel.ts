export interface Voxel {
  // Dimenstions = the size ( W, H, L )
  dimensions: number[];

  // Positions in world, id, meta
  // x,y,z, id, meta
  voxels: number[];
  /**
   * 
	dimensions: [x,y,z]
	voxels: [] // Length should be dimensions x*y*z
   */
}
