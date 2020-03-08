import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  ViewChild
} from '@angular/core';

import { FormControl, FormGroup } from '@angular/forms';

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

  public readonly boxForm: FormGroup = new FormGroup({
    x: new FormControl(),
    y: new FormControl(),
    z: new FormControl()
  });

  private readonly animate: () => void = () => {
    requestAnimationFrame(this.animate);

    this.cubes.forEach((cube: Mesh): void => {
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;
    })

    this.renderer.render(this.scene, this.camera);
  };

  private readonly scene: Scene;
  private readonly camera: PerspectiveCamera;
  private readonly renderer: WebGLRenderer;

  private readonly cubes: Mesh[] = [];

  public constructor() {
    this.scene = new Scene();
    this.camera = new PerspectiveCamera(
        75,
        1,
        0.1,
        1000);
    this.renderer = new WebGLRenderer();

    this.camera.position.z = 5;
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

  public onBoxSubmit(form: {x: string, y: string, z: string}) {
    this.addCube(
        Number.parseFloat(form.x),
        Number.parseFloat(form.y),
        Number.parseFloat(form.z));
  }

  private addCube(x: number, y: number, z: number): void {
    const geometry = new BoxGeometry();
    const material = new MeshBasicMaterial({color: 0xff7f00});
    const cube = new Mesh(geometry, material);

    cube.position.x = x;
    cube.position.y = y;
    cube.position.z = z;

    this.cubes.push(cube);
    this.scene.add(cube);
  }

  private correctScaling() {
    this.camera.aspect = this.getCanvasWidth() / this.getCanvasHeight();
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(this.getCanvasWidth(), this.getCanvasHeight());

    this.rendererContainer.nativeElement.style.width =
        `${this.getCanvasWidth()}px`;
    this.rendererContainer.nativeElement.style.height =
        `${this.getCanvasHeight()}px`;
  }

  private getCanvasWidth() {
    return 0.8 * window.innerWidth;
  }

  private getCanvasHeight() {
    return window.innerHeight;
  }

}
