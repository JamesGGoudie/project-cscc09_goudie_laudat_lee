// References: 
// https://github.com/mrdoob/three.js/blob/master/examples/misc_controls_transform.html

// Shortcuts:
/*
    G                       = Translate (Grab)
    S                       = Scale
    R                       = Rotate
    +                       = Increase size of control
    -                       = Decrease size of control
    Shift                   = turn on snap to grid
    Ctrl                    = turn off snap to grid
    Left-click and drag     = orbit
    Right-click and drag    = pan
    Scroll                  = zoom in/out
    Esc                     = deselect current object
    Backspace               = delete current object
    C                       = reset camera
*/

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';

let Editor = function(){
    const HIGHLIGHT_OUTLINE = {color:0xff9100, linewidth:3};
    const DEFAULT_OUTLINE = {color:0x555555};
    const DEFAULT_MATERIAL = {color: 0x888888};

    let camera, scene, renderer, control, orbit;
    let currentSelection;

    init();
    render();

    function init() {
        // Set up renderer
        renderer = new THREE.WebGLRenderer();
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setSize( window.innerWidth, window.innerHeight );
        renderer.setClearColor (0x222222, 1);
        document.body.appendChild( renderer.domElement );

        // Camera
        camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 1, 7500 );
        camera.position.set( 2000, 1000, 2000 );
        camera.lookAt( 0, 200, 0 );

        // Scene with grid
        scene = new THREE.Scene();
        scene.add( new THREE.GridHelper( 2000, 10 ) );

        // Lighting
        var light = new THREE.DirectionalLight( 0xffffff, 1.5);
        light.position.set( 1, 1, 1 );
        scene.add( light );

        // Orbit (camera) and Transform controls
        orbit = new OrbitControls( camera, renderer.domElement );
        orbit.update();
        orbit.addEventListener( 'change', render );

        control = new TransformControls( camera, renderer.domElement );
        control.addEventListener( 'change', render );
        control.addEventListener( 'dragging-changed', function ( event ) {
            orbit.enabled = ! event.value;
        } );

        // Set space to World
        control.setSpace('world');

        window.addEventListener( 'resize', onWindowResize, false );

        // Keyboard shortcuts
        window.addEventListener( 'keydown', function ( event ) {
            switch ( event.keyCode ) {
                case 16: // Shift
                    control.setTranslationSnap( 100 );
                    control.setRotationSnap( THREE.MathUtils.degToRad( 15 ) );
                    control.setScaleSnap( 0.25 );
                    break;
                case 71: // G
                    control.setMode( "translate" );
                    break;
                case 82: // R
                    control.setMode( "rotate" );
                    break;
                case 83: // S
                    control.setMode( "scale" );
                    break;
                case 187:
                case 107: // +, =, num+
                    control.setSize( control.size + 0.1 );
                    break;
                case 189:
                case 109: // -, _, num-
                    control.setSize( Math.max( control.size - 0.1, 0.1 ) );
                    break;
                case 27: // Esc
                    deselectObject();
                    break;
                case 8: // Backspace
                    deleteObject(currentSelection);
                    break;
                case 67: // C 
                    resetCamera();
                    break;
            }
        } );

        window.addEventListener( 'keyup', function ( event ) {
            switch ( event.keyCode ) {
                case 17: // Ctrl
                    control.setTranslationSnap( null );
                    control.setRotationSnap( null );
                    control.setScaleSnap( null );
                    break;
            }
        } );
        control.addEventListener('objectChange', onObjectChange);
    }

    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize( window.innerWidth, window.innerHeight );
        render();
    }

    function onObjectChange(e) {
        // console.log('object changed');
        // console.log(e); // TODO 
    }

    function render() {
        renderer.render( scene, camera );
    }

    function resetCamera() {
        camera.position.set( 2000, 1000, 2000 );
        camera.lookAt( 0, 200, 0 );
        render();
    }

    function importScene(sceneJson){
        // TODO
    }

    function exportScene() {
        // TODO
    }

    function selectObject(obj) {
        console.log('selected: ', obj);
        deselectObject();

        if (!(obj instanceof THREE.GridHelper)) {
            // outline object
            outlineObject(obj, HIGHLIGHT_OUTLINE);
        
            // show transform controls on object
            currentSelection = obj;
            control.attach( obj );
            scene.add( control );
            render();
        }
    }

    // deselects current object
    function deselectObject() {
        var selected = currentSelection;
        if (selected) {
            // remove outline from object
            outlineObject(currentSelection, DEFAULT_OUTLINE);

            // remove transform controls
            control.detach( selected );
            scene.remove( control );
            render();
        }
        currentSelection = null;
    }

    // color edges of the given object with the given color
    // if color = null, remove existing outlines
    function outlineObject(obj, mat) {
        // remove current outline, if any
        if (obj.wireframe) {
            obj.remove(obj.wireframe);
            obj.wireframe = null;
        }
        // give new outline of given color
        if (mat) {
            let edges = new THREE.EdgesGeometry( obj.geometry );
            let wireframe = new THREE.LineSegments( edges, new THREE.LineBasicMaterial( mat ) );
            obj.wireframe = wireframe;
            obj.add(wireframe);
        }
    }

    function addNewObject(type) {
        let geometry, prop, name;
        let material = new THREE.MeshBasicMaterial( DEFAULT_MATERIAL ); // this one has no shading
        // let material = new THREE.MeshStandardMaterial( DEFAULT_MATERIAL ); // this one has shading
        
        if (type == 'box') {
          prop = {width:200, height:200, depth:200};
          geometry = new THREE.BoxBufferGeometry( prop.width, prop.height, prop.depth );
          name = 'Box';
        } else if (type == 'cone') {
          prop = {radius:100, height:200, radSeg:32};
          geometry = new THREE.ConeBufferGeometry( prop.radius, prop.height, prop.radSeg ); // radius, height, radial segments
          name = 'Cone';
        } else {
          return;
        }
        let mesh = new THREE.Mesh( geometry, material );
        mesh.name = name;
        scene.add( mesh );
        mesh.position.set(0, 100, 0);
        outlineObject(mesh, DEFAULT_OUTLINE);
        render();
    };

    function deleteObject(obj) {
        if (obj) {
            deselectObject();
            obj.geometry.dispose();
            obj.material.dispose();
            scene.remove(obj);
            render();
        }
    };

    this.getCurrentSelection = function() {
        return currentSelection;
    };

    this.getObjectList = function(){
        return scene.children.filter(obj => obj instanceof THREE.Mesh);
    };

    this.selectObject = selectObject;
    this.addNewObject = addNewObject;
    this.deleteObject = deleteObject;

    // when selecting an object by clicking on it
    document.addEventListener('click', function(e) {
        e.preventDefault();
        // Only select if nothing is currently selected
        if (!currentSelection) {
            var raycaster = new THREE.Raycaster();
            var mouse = new THREE.Vector2();
            mouse.x = ( e.clientX / renderer.domElement.clientWidth ) * 2 - 1;
            mouse.y = - ( e.clientY / renderer.domElement.clientHeight ) * 2 + 1;
            raycaster.setFromCamera( mouse, camera );

            var intersects = raycaster.intersectObjects( scene.children ); 
            if ( intersects.length > 0) {
                selectObject(intersects[0].object);
            }
        } 
    });

};

export { Editor }