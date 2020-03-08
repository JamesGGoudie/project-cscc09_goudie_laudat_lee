import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  ViewChild
} from '@angular/core';

import {
  BoxGeometry,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Scene,
  WebGLRenderer
} from 'three';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss']
})
export class EditorComponent implements AfterViewInit {

  @ViewChild('rendererContainer')
  public readonly rendererContainer: ElementRef<HTMLDivElement>;

  private readonly animate: () => void = () => {
    requestAnimationFrame(this.animate);

    this.cube.rotation.x += 0.01;
    this.cube.rotation.y += 0.01;

    this.renderer.render(this.scene, this.camera);
  };

  private readonly scene: Scene;
  private readonly camera: PerspectiveCamera;
  private readonly renderer: WebGLRenderer;

  private readonly cube: Mesh;

  public constructor() {
    this.scene = new Scene();
    this.camera = new PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000);
    this.renderer = new WebGLRenderer();

    this.camera.position.z = 5;

    const geometry = new BoxGeometry();
    const material = new MeshBasicMaterial({color: 0xff7f00});
    this.cube = new Mesh(geometry, material);

    this.scene.add(this.cube);
  }

  public ngAfterViewInit(): void {
    this.rendererContainer.nativeElement.appendChild(this.renderer.domElement);
    this.correctScaling();

    this.animate();
  }

  @HostListener('window:resize', ['$event'])
  public onResize(e: Event) {
    this.correctScaling();
  }

  private correctScaling() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.rendererContainer.nativeElement.style.width =
        `${window.innerWidth}px`;
    this.rendererContainer.nativeElement.style.height =
        `${window.innerHeight}px`;
  }

}
