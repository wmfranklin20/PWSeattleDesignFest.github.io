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
    const footer = document.getElementById(`footer`).offsetHeight;
    console.log(footer);
    mainViewer.style.width = (width - 20) + 'px';
    console.log(mainViewer.style.height);
    console.log(height - header - buttons - footer);
    mainViewer.style.height = (height - header - buttons - footer - 20) + 'px';
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
    camera.position.set (30,30,30);
    camera.up = new THREE.Vector3 (0,0,1);
    camera.lookAt (0,0,10);

    /*Controls import*/
    let controls = new OrbitControls ( camera, renderer.domElement);
    controls.target = new THREE.Vector3(0,0,0);

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
    backdirectionalLight.castShadow = true;
    backdirectionalLight.shadow.mapSize.width = 1024 * 5;
    backdirectionalLight.shadow.mapSize.height = 1024 * 5;
    backdirectionalLight.decay = 2;
    backdirectionalLight.distance = 10000;
    scene.add(backdirectionalLight);

    const baseColor = new THREE.Color ( "rgb(65, 67, 68)" );
    const baseMesh = new THREE.Mesh( new THREE.PlaneGeometry( 25,25), new THREE.MeshPhongMaterial ({color:baseColor}));
    scene.add(baseMesh);
    baseMesh.receiveShadow = true;

    /*const baseMat = new THREE.MeshPhongMaterial( {color: 'white'} );*/

    /*Rhino Model Importer*/
    const loader = new Rhino3dmLoader();
    loader.setLibraryPath('https://cdn.jsdelivr.net/npm/rhino3dm@7.15.0/');
  
    let loadedObjects = [];

    loader.load ('public/Heat-Surfaces.3dm', function (object) {
        object.traverse( function (child) {
            child.castShadow = true;
            child.receiveShadow = true;
        });
        scene.add(object);
        object.visible = false;
        loadedObjects[0] = object;
    });

    loader.load ('public/Curves.3dm', function (object) {
        object.traverse( function (child) {
            child.castShadow = true;
            child.receiveShadow = true;
        });
        scene.add(object);
        object.visible = false;
        loadedObjects[1] = object;
    });

    loader.load ('public/Curtains.3dm', function (object) {
        object.traverse( function (child) {
            child.castShadow = true;
            child.receiveShadow = true;
        });
        scene.add(object);
        loadedObjects[2] = object;
    });
    
    loader.load ('public/Scaffolding.3dm', function (object) {
        object.traverse( function (child) {
            child.castShadow = true;
            child.receiveShadow = true;
        });
        scene.add(object);
        loadedObjects[3] = object;
    });

    loader.load ('public/Frame-Fabric.3dm', function (object) {
        object.traverse( function (child) {
            child.castShadow = true;
            child.receiveShadow = true;
        });
        scene.add(object);
        loadedObjects[4] = object;
    });

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
    };

    let headerTitleText = document.getElementById('header-title');
    let headerDescText = document.getElementById('header-desc-text');

    function updateState() {
        /*console.log(state);*/
        if (state == 0) {
            headerTitleText.textContent = `UNFOLD`;
            headerDescText.textContent = `Welcome to our interactive webpage for the 2023 SDF Block Party! Join us in a journey that fuses art and science. As you wander through the space, you will have a deeper undertanding of the intricate interplay between urban development and reduction of green spaces, and the the urban heat island effect in Seattle.`;
            camera.position.set (30,30,10);
            camera.lookAt (0,0,10);
            controls.target = new THREE.Vector3(0,0,10);
            loadedObjects.forEach((object, index) => {
                if (index > 1) {
                    object.visible = true;
                } else {
                    object.visible = false;
                }
            });
        } else if (state == 1) {
            headerTitleText.textContent = `${state}. Urban Heat Map Density`;
            headerDescText.textContent = `The map shows the urban heat island effect in King County. A growing density of heat-absorbing surfaces and consequently a reduction of vegetated space produve an urban heat island effect that is boosting temperatures. The heat islands are color coded according to their intensity with red representating the greateset intensity.`;
            camera.position.set (10,10,40);
            camera.lookAt (0,0,10);
            controls.target = new THREE.Vector3(0,0,10);
            loadedObjects.forEach((object, index) => {
                if (index === 0) {
                    object.visible = true;
                } else {
                    object.visible = false;
                }
            });
        } else if (state == 2) {
            headerTitleText.textContent = `${state}. Map Translation`;
            headerDescText.textContent = `Loose curves were generated by the data provided by map.  The curves were defined as the boundaries of the various heat intensity regions. `;
            camera.position.set (20,20,25);
            camera.lookAt (0,0,15);
            loadedObjects.forEach((object, index) => {
                if (index === 0 || index === 1) {
                    object.visible = true;
                } else {
                    object.visible = false;
                }
            });
        } else if (state == 3) {
            headerTitleText.textContent = `${state}. Fabric Extrusion`;
            headerDescText.textContent = `A coral woven linen fabric extrudes out from the curves at differnt lengths. The different fabric lengths represent the heat island intensity derived from the map. The extrapolation of the urban heat island effect results in an immersive experience, where color and translucency make for a dynamic space.`;
            controls.target = new THREE.Vector3(0,0,15);
            camera.position.set (40,40,25);
            camera.lookAt (0,0,15);
            loadedObjects.forEach((object, index) => {
                if (index === 1 || index === 2) {
                    object.visible = true;
                } else {
                    object.visible = false;
                }
            });
        } else if (state == 4) {
            headerTitleText.textContent = `${state}. Canopy Scaffolding`;
            headerDescText.textContent = `Heat-absording surfaces, like building and roads, produce an urban heat island effect that is boosting temperatures. The urban heat island effect can be mitigated by simple strategies like increasing tree canopy, the installataion of green or coll roofs and the installation of permeable surfaces.  For more inforamtion: `;
            camera.position.set (40,40,25);
            camera.lookAt (0,0,15);
            controls.target = new THREE.Vector3(0,0,15);
            loadedObjects.forEach((object, index) => {
                if (index > 1 && index < 4) {
                    object.visible = true;
                } else {
                    object.visible = false;
                }
            });
        } else if (state == 5) {
            headerTitleText.textContent = `${state}. Canopy Fabric`;
            headerDescText.textContent = `Heat-absording surfaces, like building and roads, produce an urban heat island effect that is boosting temperatures. The urban heat island effect can be mitigated by simple strategies like increasing tree canopy, the installataion of green or coll roofs and the installation of permeable surfaces.  For more inforamtion: `;
            camera.position.set (40,40,25);
            camera.lookAt (0,0,15);
            controls.target = new THREE.Vector3(0,0,15);
            loadedObjects.forEach((object, index) => {
                if (index > 1) {
                    object.visible = true;
                } else {
                    object.visible = false;
                }
            });
        } else if (state == 6) {
            headerTitleText.textContent = `${state}. Up-Cycling and Future Use`;
            headerDescText.textContent = `The pavilion presents an up-cycled space generated from a grid system and sustainable materials. The coral linen is a surplus from a clothing brand, and after SDF it will be donated towards for use in the fabrication of clothing & accesories. The scaffolding and scrim will be re-used in future construction sites.`;
            camera.position.set (30,30,10);
            camera.lookAt (0,0,10);
            controls.target = new THREE.Vector3(0,0,10);
        } else {
            headerTitleText.textContent = `Whoops!`;
            headerDescText.textContent = `Looks like something broke on our end! Please hit back or next to return to the previous page!`;
            camera.position.set (30,30,10);
            camera.lookAt (0,0,10);
            controls.target = new THREE.Vector3(0,0,10);
        };
    };

    function backButton () {
        document.getElementById('back').addEventListener('click', function() {
            if (state > 0) {
                state -= 1;
            };
            updateState();
        });
    };
    backButton();

    function nextButton () {
        document.getElementById('next').addEventListener('click', function() {
            if (state < 6) {
                state += 1;
            };
            updateState();
        });
    };
    nextButton();

    updateState();

    function enterButton () {
        document.getElementById('enter-button').addEventListener('click', function() {
            let landing = document.getElementById('landing-page');
            landing.style.height = '0px';
            landing.style.opacity = '0';
            let landingText = document.getElementById('landing-content');
            landingText.style.height = '0px';
            landingText.style.opacity = '0';
        });
    };
    enterButton();
};

mainViewer();

