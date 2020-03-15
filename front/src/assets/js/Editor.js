// References:
// https://github.com/mrdoob/three.js/blob/master/examples/misc_controls_transform.html

// Shortcuts:
/*
    shift+ G                 = Translate (Grab)
    shift+ S                 = Scale
    shift+ R                 = Rotate
    shift+ +                 = Increase size of control
    shift+ -                 = Decrease size of control
    hold Shift              = turn on snap to grid
    Left-click and drag     = orbit
    Right-click and drag    = pan
    Scroll                  = zoom in/out
    shift+D                 = deselect current object
    shift+Backspace          = delete current object
    shift+Z                  = reset camera
*/

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
// import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';

let Editor = function(){
    const HIGHLIGHT_OUTLINE = {color:0xff9100, linewidth:3};
    const DEFAULT_OUTLINE = {color:0x555555};
    const DEFAULT_MATERIAL = {color: 0x888888};

    let camera, scene, renderer, control, orbit;
    let currentSelection;
    let objectChangeCallback;

    init();
    render();

    function init() {
        // Set up renderer
        renderer = new THREE.WebGLRenderer();
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setSize( window.innerWidth, window.innerHeight );
        renderer.setClearColor (0xcccccc, 1);
        // renderer.setClearColor (0x222222, 1);
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
            if (event.shiftKey) {
                switch ( event.keyCode ) {
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
                    case 90: // Z
                        resetCamera();
                        break;
                }
            }

            if (event.keyCode == 16) { // Shift
                control.setTranslationSnap( 100 );
                control.setRotationSnap( THREE.MathUtils.degToRad( 15 ) );
                control.setScaleSnap( 0.25 );
            }
        } );

        window.addEventListener( 'keyup', function ( event ) {
            if (event.keyCode == 16) { // Shift
                control.setTranslationSnap( null );
                control.setRotationSnap( null );
                control.setScaleSnap( null );
            }
        } );
    }

    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize( window.innerWidth, window.innerHeight );
        render();
    }

    // function onObjectChange(e) {
    //     // console.log('object changed');
    //     // console.log(e); // TODO
    //     if (objectChangeFunc) objectChangeFunc();
    // }

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

    function saveScene() {
        // save only the objects in the scene
        let allObjects = scene.children.filter(obj => obj instanceof THREE.Mesh);
        let exportedObjects = [];
        allObjects.forEach(function(obj){
            let data = {
                name: obj.name,
                position: obj.position.toArray(),
                scale: obj.scale.toArray(),
                rotation: obj.rotation.toArray(),
                geometryType: obj.geometry.type,
                materialColorHex: obj.material.color.getHexString()
            };
            exportedObjects.push(data);
        });
        console.log(exportedObjects);
        console.log(JSON.stringify(exportedObjects));
    }

    function loadScene(data) {
        // clear all existing objects
        clearScene();
        if (data){
            let parsed;

            if (typeof data === 'string') {
                parsed = JSON.parse(data);
            } else {
                parsed = data;
            }

            parsed.forEach(function(objData){
                let geometry, material, mesh;
                switch(objData.geometryType){
                    case 'BoxBufferGeometry':
                        geometry = new THREE.BoxBufferGeometry( 200, 200, 200 );
                        break;
                    case 'ConeBufferGeometry':
                        geometry = new THREE.ConeBufferGeometry( 100, 200, 32 );
                        break;
                }
                // set name and material
                material = new THREE.MeshBasicMaterial({color:'#'+objData.materialColorHex});
                mesh = new THREE.Mesh(geometry, material);
                mesh.name = objData.name;

                // set position, scale and rotation
                mesh.position.set(objData.position[0], objData.position[1], objData.position[2]);
                mesh.scale.set(objData.scale[0], objData.scale[1], objData.scale[2]);
                mesh.rotation.set(objData.rotation[0], objData.rotation[1], objData.rotation[2]);

                // add to scene
                scene.add( mesh );
                mesh.uuid = String(objData.objectId);
                outlineObject(mesh, DEFAULT_OUTLINE);
            });
            render();
        }
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
        if (objectChangeCallback) objectChangeCallback();
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

        return mesh;
    };

    function deleteObject(obj) {
        if (obj) {
            if (obj==currentSelection) deselectObject();
            obj.geometry.dispose();
            obj.material.dispose();
            scene.remove(obj);
            render();
        }
    };

    function clearScene(){
        let allObjects = scene.children.filter(obj => obj instanceof THREE.Mesh);
        allObjects.forEach(function(obj){
            deleteObject(obj);
        });
    }

    this.setObjectChangeCallback = function(callback) {
        if (callback) {
            objectChangeCallback = callback;
            control.addEventListener('objectChange', callback);
        }
    }

    this.getCurrentSelection = function() {
        return currentSelection;
    };

    this.getObjectList = function(){
        return scene.children.filter(obj => obj instanceof THREE.Mesh);
    };

    this.changeTool = function(tool) {
        switch(tool) {
            case "translate":
            case "scale":
            case "rotate":
                control.setMode( tool );
                break;
        }
    }

    this.updateObjectPosition = function(obj, x, y, z){
        if (obj && x!=null && y!=null && z!=null) {
            obj.position.set(x, y, z);
            render();
        }
    };

    this.updateObjectScale = function(obj, x, y, z){
        if (obj && x!=null && y!=null && z!=null) {
            obj.scale.set(x, y, z);
            render();
        }
    };

    this.updateObjectRotation = function(obj, x, y, z){
        if (obj && x!=null && y!=null && z!=null) {
            obj.rotation.set(x, y, z);
            render();
        }
    };

    this.updateObjectMaterial = function(obj, color){
        if (obj && color) {
            obj.material.color.set(color);
            render();
        }
    };

    this.selectObject = selectObject;
    this.addNewObject = addNewObject;
    this.deleteObject = deleteObject;
    this.deselectObject = deselectObject;
    this.saveScene = saveScene;
    this.loadScene = loadScene;

    this.renderer = renderer;
    this.camera = camera;
    this.scene = scene;

};

export { Editor }
