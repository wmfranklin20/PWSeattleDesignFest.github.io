import * as THREE from 'https://unpkg.com/three@0.154.0/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.154.0/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.154.0/examples/jsm/loaders/GLTFLoader.js';
import { Rhino3dmLoader } from 'https://unpkg.com/three@0.154.0/examples/jsm/loaders/3DMLoader.js';

let state = 0;

function updateWindowSize () {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const mainViewer = document.getElementById(`model-viewer`);
    const header = document.getElementById(`header`).offsetHeight;
    console.log(header);
    const buttons = document.getElementById(`buttons`).offsetHeight;
    console.log(buttons);
    const footer = document.getElementById(`buttons`).offsetHeight;
    console.log(footer);
    mainViewer.style.width = (width - 20) + 'px';
    console.log(mainViewer.style.height);
    console.log(height - header - buttons - footer);
    mainViewer.style.height = (height - header - buttons - footer - 75) + 'px';
    console.log(mainViewer.style.height);
    console.log(`Window size: ${width} x ${height}`);
}
updateWindowSize();
window.addEventListener('resize', updateWindowSize);


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
    camera.position.set (30,30,10);
    camera.up = new THREE.Vector3 (0,0,1);
    camera.lookAt (0,0,10);

    /*Controls import*/
    /*let controls = new OrbitControls ( camera, renderer.domElement);
    controls.target = new THREE.Vector3(0,0,15);*/

    /*Lighting setup*/
    /*Ambient Light for basic scene lighting*/
    const ambientColor = new THREE.Color ( "rgb(255,255,255)" )
    const ambientLight = new THREE.AmbientLight(ambientColor, 0.65);
    scene.add(ambientLight);

    /*Primary spot light*/
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

    /*Backlight*/
    const backdirectionalLight = new THREE.DirectionalLight(0xffffff, 1.25);
    backdirectionalLight.position.set(50, -50, 75);
    scene.add(backdirectionalLight);

    const baseMesh = new THREE.Mesh( new THREE.PlaneGeometry( 2000,2000), new THREE.MeshPhongMaterial ({color:'white'}));
    scene.add(baseMesh);
    baseMesh.receiveShadow = true;

    /*const baseMat = new THREE.MeshPhongMaterial( {color: 'white'} );*/

    /*Rhino Model Importer*/
    const loader = new Rhino3dmLoader();
    loader.setLibraryPath('https://cdn.jsdelivr.net/npm/rhino3dm@7.15.0/');
  
    loader.load ('public/Heat-Surfaces.3dm', function (object) {
        object.traverse( function (child) {
            child.castShadow = true;
            child.receiveShadow = true;
        });
        scene.add(object);
    });

    loader.load ('public/Scaffolding.3dm', function (object) {
        object.traverse( function (child) {
            child.castShadow = true;
            child.receiveShadow = true;
        });
        scene.add(object);
    });

    loader.load ('public/Frame-Fabric.3dm', function (object) {
        object.traverse( function (child) {
            child.castShadow = true;
            child.receiveShadow = true;
        });
        scene.add(object);
    });

    function loadModel(state) {
        const childVisibility = {};
        loader.load ('public/Curtains.3dm', function (object) {
            console.log(state);
            if (Number(state) === 5) {
                object.visible = false;
                console.log(object.visible);
            } else {
                object.visible = true;
                console.log(object.visible);
            }
            object.traverse((child) => {
                child.castShadow = true;
                child.receiveShadow = true;
            });

            scene.add(object);
        });
    };
    loadModel(state);

    function render () {
        camera.updateMatrixWorld();
        renderer.render( scene, camera );
    }
    function animate() {
        requestAnimationFrame( animate );
        render();
    }
    animate();

    window.addEventListener('resize', handleWindowResize);
    function handleWindowResize() {
        const wrapperWidth = wrapper.clientWidth;
        const wrapperHeight = wrapper.clientHeight;
        camera.aspect = wrapperWidth / wrapperHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(wrapperWidth, wrapperHeight);
    }
    let footerText = document.getElementById('footer-text');
    footerText.textContent = 'Hello! Welcome to our interactive webpage for the 2023 Seattle Design Festival!'
    function updateState() {
        /*console.log(state);*/
        if (state == 0) {
            footerText.textContent = `Hello! Welcome to our interactive webpage for the 2023 Seattle Design Festival!`
            camera.position.set (30,30,10);
            camera.lookAt (0,0,10);
        } else if (state == 1) {
            footerText.textContent = `${state}. Focus on heat map and color meaning.`
            camera.position.set (30,30,45);
            camera.lookAt (0,0,10);
        } else if (state == 2) {
            footerText.textContent = `${state}. Curves as a function of height maps.`
            camera.position.set (40,40,25);
            camera.lookAt (0,0,15);
        } else if (state == 3) {
            footerText.textContent = `${state}. Extrude fabric from curves.`
        } else if (state == 4) {
            footerText.textContent = `${state}. Scaffolding falls in around display.`
        } else if (state == 5) {
            footerText.textContent = `${state}. Fabric attached to scaffolding.`
        } else if (state == 6) {
            footerText.textContent = `${state}. Final model and features, ideally model explodes verically.`
        } else {
            footerText.textContent = `Whoops, not sure how you got here but try clicking 'Back' or 'Next' to return to a slide!`;
        };
    };
    function backButton () {
        document.getElementById('back').addEventListener('click', function() {
            if (state > 0) {
                state -= 1;
            };
            updateState();
            loadModel(state);
        });
    };
    backButton();
    function nextButton () {
        document.getElementById('next').addEventListener('click', function() {
            if (state < 6) {
                state += 1;
            };
            updateState();
            loadModel(state);
        });
    };
    nextButton();
};
mainViewer();

