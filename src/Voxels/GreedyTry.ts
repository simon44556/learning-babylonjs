import { Block } from "./Block/Block";
import { BlockType } from "./Block/BlockType";
import { MeshData } from "./MeshData";
import { Mesher } from "./Mesher";

export class GreedyMesher implements Mesher {
  //Cache
  mask: Int32Array = new Int32Array(4096);

  destructor() {
    this.mask = new Int32Array(0);
  }

  getItemInArrayForOffset(x: number, y: number, z: number, volume: Block[], dimensions: number[]) {
    const block = volume[x + dimensions[0] * (y + dimensions[1] * z)];
    return block.blockType != BlockType.AIR ? block : 0;
  }

  mesh(volume: Block[], dims: number[]): MeshData {
    const vertices: any[] = [];
    const faces: [number[]] = [[]];
    const indices: number[] = [];

    for (let dimensionLoop = 0; dimensionLoop < 3; ++dimensionLoop) {
      // TODO: Figure out this part
      // Guess is each face is defined here
      let i: number,
        j: number,
        k: number,
        l: number,
        w: number,
        h: number,
        u: number = (dimensionLoop + 1) % 3,
        v: number = (dimensionLoop + 2) % 3;

      const x: number[] = [0, 0, 0];
      const q: number[] = [0, 0, 0];

      if (this.mask.length < dims[u] * dims[v]) {
        this.mask = new Int32Array(dims[u] * dims[v]);
      }

      q[dimensionLoop] = 1;

      for (x[dimensionLoop] = -1; x[dimensionLoop] < dims[dimensionLoop]; ) {
        //TODO: Debug and put better names
        // I dont know what tf this does
        //Compute mask
        let n = 0;
        for (x[v] = 0; x[v] < dims[v]; ++x[v])
          for (x[u] = 0; x[u] < dims[u]; ++x[u], ++n) {
            // q determines the direction (X, Y or Z) that we are searching
            // m.IsBlockAt(x,y,z) takes global map positions and returns true if a block exists there

            const blockCurrent: any = 0 <= x[dimensionLoop] ? this.getItemInArrayForOffset(x[0], x[1], x[2], volume, dims) : 0;
            const blockCompare: any =
              x[dimensionLoop] < dims[dimensionLoop] - 1 ? this.getItemInArrayForOffset(x[0] + q[0], x[1] + q[1], x[2] + q[2], volume, dims) : 0;

            // The mask is set to true if there is a visible face between two blocks,
            //   i.e. both aren't empty and both aren't blocks

            // TODO: Add block comparing of type. Mesh together same types
            if (!!blockCurrent === !!blockCompare) {
              this.mask[n] = 0;
            } else if (!!blockCurrent) {
              this.mask[n] = blockCurrent;
            } else {
              this.mask[n] = -blockCompare;
            }
          }
        //Increment x[d]
        ++x[dimensionLoop];
        //Generate mesh for mask using lexicographic ordering
        n = 0;
        for (j = 0; j < dims[v]; ++j) {
          for (i = 0; i < dims[u]; ) {
            let c = this.mask[n];
            if (!!c) {
              //Compute width
              for (w = 1; c === this.mask[n + w] && i + w < dims[u]; ++w) {}

              //Compute height (this is slightly awkward
              let done = false;
              for (h = 1; j + h < dims[v]; ++h) {
                for (k = 0; k < w; ++k) {
                  if (c !== this.mask[n + k + h * dims[u]]) {
                    done = true;
                    break;
                  }
                }
                if (done) {
                  break;
                }
              }

              //Add quad
              x[u] = i;
              x[v] = j;

              const du = [0, 0, 0],
                dv = [0, 0, 0];
              if (c > 0) {
                dv[v] = h;
                du[u] = w;
              } else {
                c = -c;
                du[v] = h;
                dv[u] = w;
              }

              const vertex_count = vertices.length / 3;

              // vertices.push([x[0], x[1], x[2]]);
              // vertices.push([x[0] + du[0], x[1] + du[1], x[2] + du[2]]);
              // vertices.push([x[0] + du[0] + dv[0], x[1] + du[1] + dv[1], x[2] + du[2] + dv[2]]);
              // vertices.push([x[0] + dv[0], x[1] + dv[1], x[2] + dv[2]]);

              vertices.push(
                x[0],
                x[1],
                x[2],
                x[0] + du[0],
                x[1] + du[1],
                x[2] + du[2],
                x[0] + du[0] + dv[0],
                x[1] + du[1] + dv[1],
                x[2] + du[2] + dv[2],
                x[0] + dv[0],
                x[1] + dv[1],
                x[2] + dv[2]
              );

              faces.push([vertex_count, vertex_count + 1, vertex_count + 2, c]);
              faces.push([vertex_count, vertex_count + 2, vertex_count + 3, c]);

              indices.push(vertex_count + 2, vertex_count + 1, vertex_count);
              indices.push(vertex_count + 3, vertex_count + 2, vertex_count);

              //Zero-out mask
              for (l = 0; l < h; ++l)
                for (k = 0; k < w; ++k) {
                  this.mask[n + k + l * dims[u]] = 0;
                }
              //Increment counters and continue
              i += w;
              n += w;
            } else {
              ++i;
              ++n;
            }
          }
        }
      }
    }

    //END
    return { vertices: vertices, faces: faces, indices: indices };
  }
}
