import * as THREE from 'https://unpkg.com/three@0.154.0/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.154.0/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.154.0/examples/jsm/loaders/GLTFLoader.js';
import { Rhino3dmLoader } from 'https://unpkg.com/three@0.154.0/examples/jsm/loaders/3DMLoader.js';
import { TWEEN } from 'https://unpkg.com/three@0.139.0/examples/jsm/libs/tween.module.min.js';

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
    camera.lookAt (0,0,0);

    /*Controls import*/
    let controls = new OrbitControls ( camera, renderer.domElement);
    controls.target = new THREE.Vector3(0,0,0);

    /*Lighting setup*/
    /*Ambient Light for basic scene lighting*/
    const ambientColor = new THREE.Color ( "rgb(242,242,242)" )
    const ambientLight = new THREE.AmbientLight(ambientColor, 0.5);
    scene.add(ambientLight);

    /*Primary spot light*/
    const spotColor = new THREE.Color ( "rgb(255,255,255)" );
    const spotLight = new THREE.SpotLight ( spotColor );
    scene.add(spotLight);

    const spotLightHelper = new THREE.SpotLightHelper( spotLight );
    /*scene.add(spotLightHelper);*/
    
    spotLight.position.set (0,0,75);
    spotLight.castShadow = true;
    spotLight.intensity = 1.00;
    spotLight.angle = Math.PI / 8;
    spotLight.penumbra = 1;
    spotLight.decay = 1;
    spotLight.distance = 0;
    spotLight.shadow.camera.near = 1;
    spotLight.shadow.camera.far = 4000;
    spotLight.shadow.camera.fov = 30;
    spotLight.shadow.bias = -0.0005;
    spotLight.shadow.mapSize.width = 1024*5;
    spotLight.shadow.mapSize.height = 1024*5;

    /*Frontlight*/
    const frontColor = new THREE.Color ( "rgb(255,255,255)" );
    const frontdirectionalLight = new THREE.DirectionalLight( frontColor );
    frontdirectionalLight.position.set(50, 50, 75);
    frontdirectionalLight.intensity = 0.65;
    frontdirectionalLight.castShadow = true;
    frontdirectionalLight.shadow.mapSize.width = 1024 * 5;
    frontdirectionalLight.shadow.mapSize.height = 1024 * 5;
    frontdirectionalLight.shadow.bias = -0.0005;
    frontdirectionalLight.decay = 1;
    frontdirectionalLight.distance = 100;
    scene.add(frontdirectionalLight);

    /*Backlight*/
    const backColor = new THREE.Color ( "rgb(255,255,255)" );
    const backdirectionalLight = new THREE.DirectionalLight( backColor );
    backdirectionalLight.position.set(-50, -50, 75);
    backdirectionalLight.intensity = 0.35;
    backdirectionalLight.castShadow = true;
    backdirectionalLight.shadow.mapSize.width = 1024 * 5;
    backdirectionalLight.shadow.mapSize.height = 1024 * 5;
    backdirectionalLight.shadow.bias = -0.0005;
    backdirectionalLight.decay = 1;
    backdirectionalLight.distance = 100;
    scene.add(backdirectionalLight);

    const baseColor = new THREE.Color ( "rgb(232, 232, 232)" );
    const baseMesh = new THREE.Mesh( new THREE.PlaneGeometry( 3500, 3500), new THREE.MeshPhongMaterial ({color:baseColor}));
    scene.add(baseMesh);
    baseMesh.receiveShadow = true;

    /*const baseMat = new THREE.MeshPhongMaterial( {color: 'white'} );*/

    /*Rhino Model Importer*/
    const loader = new Rhino3dmLoader();
    loader.setLibraryPath('https://cdn.jsdelivr.net/npm/rhino3dm@7.15.0/');
  
    /*loadedObjects Order = 
        0. Heat-Map
        1. Heat Curves
        2. Heat Curtains
        3. Scaffolding
        4. Frame Fabric
    */
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
        spotLightHelper.update();
    }
    function animate() {
        requestAnimationFrame( animate );
        TWEEN.update();
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

    function animateCamera(targetPosition, targetPoint, controlsTarget, duration) {
        var currentPosition = camera.position.clone();

        new TWEEN.Tween(currentPosition)
            .to(targetPosition, duration)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .onUpdate(function() {
                camera.position.copy(currentPosition);
                camera.lookAt(targetPoint);
                controls.target = controlsTarget;
            })
            .start();
    };

    function animateObject(object, targetZ, duration) {
        var currentPosition = object.position.clone();
        var targetPosition = new THREE.Vector3(currentPosition.x, currentPosition.y, targetZ);

        new TWEEN.Tween(currentPosition)
            .to(targetPosition, duration)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .onUpdate(function () {
                object.position.copy(currentPosition);
            })
            .start();
    };



    let headerTitleText = document.getElementById('header-title');
    let headerDescText = document.getElementById('header-desc-text');

    function updateState() {
        /*console.log(state);*/
        if (state == 0) {
            headerTitleText.textContent = `"UNFOLD"`;
            headerDescText.textContent = `Join us in a journey that fuses art and science. As you wander through the space, you will have a deeper understanding of the intricate interplay between urban development, the reduction of green spaces, and the urban heat island effect in Seattle.`;         
            animateCamera(new THREE.Vector3(25,25,10), new THREE.Vector3(0,0,10), new THREE.Vector3(0,0,10), 5000);
            loadedObjects.forEach((object, index) => {
                if (index > 1) {
                    object.visible = true;
                    animateObject(object, 0, 1000*index);
                } else {
                    object.visible = false;
                    animateObject(object, 100, 1000);
                }
            });
        } else if (state == 1) {
            headerTitleText.textContent = `${state}. Urban Heat Map Density`;
            headerDescText.textContent = `The map shows a growing density of heat-absorbing surfaces and a reduction of vegetated space creating an urban heat island effect that is boosting temperatures. The intensity of these heat islands are mapped, with red representing the greatest heat.`;
            animateCamera(new THREE.Vector3(15,-15,40), new THREE.Vector3(0,0,10), new THREE.Vector3(0,0,10), 3000);
            loadedObjects.forEach((object, index) => {
                if (index === 0) {
                    object.visible = true;
                    animateObject(object, 0, 1500);
                } else {
                    /*object.visible = false;*/
                    animateObject(object, 100, 1000*index);
                }
            });
        } else if (state == 2) {
            headerTitleText.textContent = `${state}. Map Translation`;
            headerDescText.textContent = `Loose curves were generated by the data provided by map.  The curves were defined as the boundaries of the various heat intensity regions. `;
            animateCamera(new THREE.Vector3(15,-15,30), new THREE.Vector3(0,0,10), new THREE.Vector3(0,0,10), 3000);
            loadedObjects.forEach((object, index) => {
                if (index === 1) {
                    object.visible = true;
                    animateObject(object, 0, 1500*index);
                } else if (index === 0) {
                    object.visible = false;
                } else {
                    object.visible = false;
                    animateObject(object, 0, 1500*index);
                }
            });
        } else if (state == 3) {
            headerTitleText.textContent = `${state}. Fabric Extrusion`;
            headerDescText.textContent = `A coral woven linen fabric extrudes out from the curves at different lengths. These lengths represent the heat island intensity derived from the map resulting in an immersive experience, where color and translucency make for a dynamic space.`;
            animateCamera(new THREE.Vector3(20,-20,5), new THREE.Vector3(0,0,10), new THREE.Vector3(0,0,10), 3000);
            loadedObjects.forEach((object, index) => {
                if (index === 1 || index === 2) {
                    object.visible = true;
                } else {
                    object.visible = false;
                }
            });
        } else if (state == 4) {
            headerTitleText.textContent = `${state}. Frame Scaffolding`;
            headerDescText.textContent = `Heat-absorbing surfaces, like building and roads, produce an urban heat island effect that is boosting temperatures. This effect can be mitigated by simple strategies like increasing tree canopy, installing green or cool roofs and installing permeable surfaces.`;
            animateCamera(new THREE.Vector3(25,-25,5), new THREE.Vector3(0,0,10), new THREE.Vector3(0,0,10), 3000);
            loadedObjects.forEach((object, index) => {
                if (index > 1 && index < 4) {
                    object.visible = true;
                } else {
                    object.visible = false;
                }
            });
        } else if (state == 5) {
            headerTitleText.textContent = `${state}. Scaffolding Fabric`;
            headerDescText.textContent = `The pavilion is shrouded in a scrim mesh to provide a more immersive experience for users and to protect the fabric within from the elements.`;
            animateCamera(new THREE.Vector3(-25,-25,5), new THREE.Vector3(0,0,10), new THREE.Vector3(0,0,10), 3000);
            loadedObjects.forEach((object, index) => {
                if (index > 1) {
                    object.visible = true;
                    animateObject(object, 0, 1500*index);
                } else {
                    object.visible = false;
                }
            });
        } else if (state == 6) {
            headerTitleText.textContent = `${state}. Up-Cycling and Future Use`;
            headerDescText.textContent = `The pavilion presents an up-cycled space generated from a grid system and sustainable materials. The linen is surplus from a clothing brand, and will be donated for use in the fabrication of clothing & accessories. The scaffolding & scrim will be re-used in future construction.`;
            animateCamera(new THREE.Vector3(-50, -50, 35), new THREE.Vector3(0,0,25), new THREE.Vector3(0,0,25), 3000);
            loadedObjects.forEach((object, index) => {
                if (index === 0) {
                    object.visible = false;
                } else if (index === 1) {
                    object.visible = false;
                } else if (index === 2) {
                    object.visible = true;
                    animateObject(object, 40, 1500);
                } else if (index === 3) {
                    object.visible = true;
                    animateObject(object, 22, 1500);
                } else if (index === 4) {
                    object.visible = true;
                    animateObject(object, 0, 1500);
                } 
            });
        } else if (state == 7) {
            headerTitleText.textContent = `Thanks for Joining!`;
            headerDescText.textContent = `Thank you for taking the time to explore our entry to the 2023 SDF Block Party! Feel free to return to the previous slides or spin around the model while you are here!`;
            animateCamera(new THREE.Vector3(-25,25,10), new THREE.Vector3(0,0,10), new THREE.Vector3(0,0,10), 5000);
            animateCamera(new THREE.Vector3(-4,25,5), new THREE.Vector3(-4,0,10), new THREE.Vector3(0,0,10), 5000);
            loadedObjects.forEach((object, index) => {
                if (index > 1) {
                    object.visible = true;
                    animateObject(object, 0, 1500);
                } else {
                    object.visible = false;
                    animateObject(object, 0, 1500);
                }
            });
        } else {
            headerTitleText.textContent = `Whoops!`;
            headerDescText.textContent = `Looks like something broke on our end! Please hit back or next to return to the previous page!`;
            camera.position.set (20,20,5);
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
            if (state < 7) {
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
            landing.style.top = '-1000px';
            landing.style.opacity = '0';
            let landingText = document.getElementById('landing-content');
            landingText.style.height = '0px';
            landingText.style.opacity = '0';
        });
    };
    enterButton();
    
};

mainViewer();
