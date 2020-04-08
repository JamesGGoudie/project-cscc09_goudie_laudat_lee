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
import { OBJExporter } from 'three/examples/jsm/exporters/OBJExporter.js';
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter.js';
import { ColladaExporter } from 'three/examples/jsm/exporters/ColladaExporter.js';

let Editor = function(){
    const HIGHLIGHT_OUTLINE = {color:0xff9100, linewidth:3};
    const DEFAULT_OUTLINE = {color:0x555555};

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

    function exportSceneAsOBJ() {
        let exporter = new OBJExporter();
        return exporter.parse(scene);
    }

    function exportSceneAsSTL() {
        let exporter = new STLExporter();
        return exporter.parse(scene);
    }

    function exportSceneAsCollada() {
        let exporter = new ColladaExporter();
        return exporter.parse(scene).data;
    }

    // Saves the current scene in JSON format
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
        return JSON.stringify(exportedObjects);
    }

    /**
     * Add an object to the scene.
     * @param objData {Object} data on the object to add
     *          - name: string
     *          - geometryType: "BoxBufferGeometry" | "ConeBufferGeometry", 
     *          - materialColorHex: string
     *          - position: array(3)
     *          - scale: array(3)
     *          - rotation: array(3)
     *          - objectId: string (Not required if adding a new object)
     * @param isNew {Boolean} true if the object to add is new to the scene, 
     *          false if it is not new (i.e. when loading from database) 
     * @returns mesh {THREE.Mesh} the object that was added
     */
    function addObjToScene(objData, isNew = false) {
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
        if (!isNew) mesh.uuid = String(objData.objectId);
        outlineObject(mesh, DEFAULT_OUTLINE);
        render();
        return mesh;
    }

    function loadObj(objData) {
        addObjToScene(objData);
        render();
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

            for (const objData of parsed) {
                addObjToScene(objData);
            }
            render();
        }
    }

    function selectObject(obj) {
        console.log('selected: ', obj);
        deselectCurrentObject();

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
    function deselectCurrentObject() {
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

    function deleteObjectByUuid(uuid) {
        deleteObject(getObjByUuid(uuid));
    }

    function getObjByUuid(uuid) {
        return scene.children.find((obj) => {
            return obj.uuid === uuid;
        });
    }

    function addNewObject(type) {
        let objData = {};
        objData.materialColorHex = '888888';
        objData.position = [0,100,0];
        objData.scale = [1,1,1];
        objData.rotation = [0,0,0];
        objData.objectId = null;

        if (type == 'box') {
            objData.geometryType = 'BoxBufferGeometry';
            objData.name = 'Box';
        } else if (type == 'cone') {
            objData.geometryType = 'ConeBufferGeometry';
            objData.name = 'Cone';
        } else {
          return null;
        }
        const mesh = addObjToScene(objData, true);
        return mesh;
    };

    function deleteObject(obj) {
        if (obj) {
            if (obj==currentSelection) deselectCurrentObject();
            obj.geometry.dispose();
            obj.material.dispose();
            scene.remove(obj);
            render();
        }
    };

    function clearScene(){
        // Get all mesh objects except for the one selected if indicated.
        let allObjects = scene.children.filter((obj) => {
            return obj instanceof THREE.Mesh;
        });

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

    this.exportScene = function(filetype) {
        deselectCurrentObject()
        switch(filetype) {
            case 'json':
                return saveScene();
            case 'obj':
                return exportSceneAsOBJ();
            case 'dae':
                return exportSceneAsCollada();
            case 'stl':
                return exportSceneAsSTL();
        }
        return null;
    };

    this.selectObject = selectObject;
    this.addNewObject = addNewObject;
    this.deleteObject = deleteObject;
    this.deselectCurrentObject = deselectCurrentObject;
    this.loadScene = loadScene;
    this.loadObj = loadObj;
    this.deleteObjectByUuid = deleteObjectByUuid;
    this.addObjToScene = addObjToScene;

    this.renderer = renderer;
    this.camera = camera;
    this.scene = scene;

};

export { Editor }
