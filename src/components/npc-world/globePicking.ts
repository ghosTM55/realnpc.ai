import { Sphere, Vector3, type Camera, type Mesh, type Object3D, type Raycaster, type Intersection } from "three";

// Raycasters only test layer 0; the camera also renders this one.
const UNPICKED = 1;
type GlobeObject = Object3D & { __globeObjType?: string };

const globeType = (object: Object3D) => {
  for (let node: GlobeObject | null = object; node; node = node.parent) {
    if (node.__globeObjType) return node.__globeObjType;
  }
  return undefined;
};

/**
 * three-render-objects raycasts the whole scene every 50 ms while the pointer
 * is over the globe (289 border lines, 288 land meshes, an 8k-triangle sphere,
 * the atmosphere and hidden graticules), yet only city points react to it.
 * Everything else moves to a layer the raycaster skips, and the water sphere
 * answers with an exact sphere hit so it still hides points on the far side.
 * Returns a cleanup that stops watching for objects three-globe adds later.
 */
export function limitPickingToCities(scene: Object3D, camera: Camera) {
  let body: Mesh | undefined;
  scene.traverse((object) => {
    if ((object as GlobeObject).__globeObjType === "globe") body ??= object.children.find((child): child is Mesh => (child as Mesh).isMesh);
  });
  // body ← 'globe' group ← globe layer group ← three-globe root, which holds one group per layer.
  const root = body?.parent?.parent?.parent;
  if (!body || !root) return () => {};
  const globeBody = body;
  const classify = (subtree: Object3D) => subtree.traverse((object) => {
    if (object === globeBody || globeType(object) === "point") object.layers.set(0);
    else object.layers.set(UNPICKED);
  });

  camera.layers.enable(UNPICKED);
  classify(root);
  const sphere = new Sphere();
  const hit = new Vector3();
  globeBody.raycast = (raycaster: Raycaster, intersects: Intersection[]) => {
    const { geometry } = globeBody;
    if (!geometry.boundingSphere) geometry.computeBoundingSphere();
    if (!geometry.boundingSphere) return;
    sphere.copy(geometry.boundingSphere).applyMatrix4(globeBody.matrixWorld);
    if (!raycaster.ray.intersectSphere(sphere, hit)) return;
    const distance = raycaster.ray.origin.distanceTo(hit);
    if (distance >= raycaster.near && distance <= raycaster.far) intersects.push({ distance, point: hit.clone(), object: globeBody });
  };
  // Land, borders and rings arrive later, into their layer's group.
  const onChildAdded = ({ child }: { child: Object3D }) => classify(child);
  root.children.forEach((group) => group.addEventListener("childadded", onChildAdded));
  return () => root.children.forEach((group) => group.removeEventListener("childadded", onChildAdded));
}
