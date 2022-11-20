import * as THREE from "three";

export default class Light {
  scene: THREE.Scene;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.initial();
  }

  initial() {
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);

    directionalLight.position.set(100, 200, 100);
    directionalLight.target.position.set(0, 0, 0);
    directionalLight.castShadow = true;
    directionalLight.shadow.bias = -0.001;
    directionalLight.shadow.mapSize.width = 4096;
    directionalLight.shadow.mapSize.height = 4096;
    directionalLight.shadow.camera.near = 0.1;
    directionalLight.shadow.camera.far = 1000.0;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 500.0;
    directionalLight.shadow.camera.left = 200;
    directionalLight.shadow.camera.right = -200;
    directionalLight.shadow.camera.top = 200;
    directionalLight.shadow.camera.bottom = -200;

    this.scene.add(directionalLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);
  }
}
