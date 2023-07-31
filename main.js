import * as THREE from 'https://unpkg.com/three@0.154.0/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.154.0/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.154.0/examples/jsm/loaders/GLTFLoader.js';
import { Rhino3dmLoader } from 'https://unpkg.com/three@0.154.0/examples/jsm/loaders/3DMLoader.js';

/*
function updateWindowSize () {
    const sizeDiv = document.getElementById('sizediv');
    const width = window.innerWidth;
    const height = window.innerHeight;
    sizeDiv.textContent = `Window size: ${width} x ${height}`;
}
updateWindowSize();
window.addEventListener('resize', updateWindowSize);
*/
function mainViewer() {

    let scene = new THREE.Scene();

    /*Locate and initialize wrapper*/
    let wrapper = document.getElementById('model-viewer');
    const wrapperWidth = wrapper.clientWidth;
    const wrapperHeight = wrapper.clientHeight;

    /*Renderer Setup*/
    let renderer = new THREE.WebGLRenderer (
    {antialias: true, alpha: true}
    );
    renderer.setSize ( wrapperWidth, wrapperHeight);
    renderer.autoClear = false;
    renderer.setClearColor (0x00000, 0,0);
    renderer.setPixelRatio (window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.gammaFactor = 0;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    wrapper.appendChild(renderer.domElement);
    
    /*Camera Setup*/
    let camera = new THREE.PerspectiveCamera(
        65,
        wrapperWidth / wrapperHeight,
        0.1,
        10000
    );
    camera.position.set (35,35,35);
    camera.up.set(0,0,1);
        
    /*Controls import*/
    let controls = new OrbitControls ( camera, renderer.domElement);

    /*Rhino Model Importer*/
    const loader = new Rhino3dmLoader();
    loader.setLibraryPath('https://cdn.jsdelivr.net/npm/rhino3dm@7.15.0/');
    loader.load ('public/PW-GLY_SDF-Pavillion-Model.3dm', function (object) {
        object.traverse( function (child) {
            if ( child.isMesh ) {
                child.castShadow = true;
                child.recieveShadow = true;
            } else {
                console.log( child.type );
            }
        });
        scene.add(object);
    });

    const ambientLight = new THREE.AmbientLight('white', 1.15);
    scene.add(ambientLight);

    const spotColor = new THREE.Color ( "rgb(255,255,255)" );
    const spotLight = new THREE.SpotLight ( spotColor );
    scene.add(spotLight);
    spotLight.position.set (-50,50,75);
    spotLight.castShadow = true;
    spotLight.intensity = 1;
    spotLight.angle = 1;
    spotLight.penumbra = Math.PI / 2;
    spotLight.decay = 2;
    spotLight.distance = 10000;
    spotLight.shadow.camera.near = 500;
    spotLight.shadow.camera.far = 4000;
    spotLight.shadow.camera.fov = 30;
    spotLight.shadow.bias = -0.005;
    spotLight.shadow.mapSize.width = 1024 * 5;
    spotLight.shadow.mapSize.height = 1024 * 5;

    const backdirectionalLight = new THREE.DirectionalLight(0xffffff, .25);
    backdirectionalLight.position.set(50, -50, 75);
    scene.add(backdirectionalLight);

    function render () {
        camera.updateMatrixWorld();
        renderer.render( scene, camera );
    }
    function animate() {
        requestAnimationFrame( animate );
        render();
    }
    animate();
};
mainViewer();