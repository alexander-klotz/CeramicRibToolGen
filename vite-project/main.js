import * as THREE from 'three';

			import { TrackballControls } from 'three/addons/controls/TrackballControls.js';

			let camera, scene, renderer, controls;

			init();
			animate();

			function init() {

				renderer = new THREE.WebGLRenderer( { antialias: true } );
				renderer.setPixelRatio( window.devicePixelRatio );
				renderer.setSize( window.innerWidth, window.innerHeight );
				document.body.appendChild( renderer.domElement );

				scene = new THREE.Scene();
				scene.background = new THREE.Color( 0x222222 );

				camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 1000 );
				camera.position.set( 0, -200, 100 );

				controls = new TrackballControls( camera, renderer.domElement );
				controls.minDistance = 5;
				controls.maxDistance = 500;

				scene.add( new THREE.AmbientLight( 0xffffff, 1 ) );

				const light = new THREE.PointLight( 0xffffff, 1, 0, 0 );
				light.position.set( 10, -100, 100 );
				scene.add( light );

        // Create an AxesHelper object
        let axesHelper = new THREE.AxesHelper(100);

        // Add it to the scene
        scene.add(axesHelper);

				// CUP CREATION
        const height = -50
        const radius = 30;
        const wallThickness = 5

        const circlePoints = [];
        // Define the radius of the circle
        const segments = 100; // Define the number of segments for the circle
        
        // Generate the points on the circle
        for (let i = 0; i <= segments; i++) {
            const theta = (i / segments) * Math.PI * 2;
            circlePoints.push(new THREE.Vector3(Math.cos(theta) * radius, Math.sin(theta) * radius, 0));
        }
        
        // Create the spline
        const closedSpline = new THREE.CatmullRomCurve3(circlePoints);
        closedSpline.curveType = 'catmullrom';
        closedSpline.closed = true;

				const extrudeSettings1 = {
					steps: 1000,
					extrudePath: closedSpline
				};

				const pts1 = []

        // CUP GENERATION
        const waveSegments = 1000;
        pts1.push(new THREE.Vector2(0, wallThickness))
        // Generate the points on the sinus wave
        for (let i = 0; i <= waveSegments; i++) {
            const x = (i / waveSegments) * height;
            const y = Math.sin(x);
            pts1.push(new THREE.Vector2(x, y));
        }
        pts1.push(new THREE.Vector2(height, wallThickness))


        // ADD TEXTURE


        // CREATE GEOMETRY AND MATERIAL

				const shape1 = new THREE.Shape( pts1 );
				const geometry1 = new THREE.ExtrudeGeometry( shape1, extrudeSettings1 );
        const material1 = new THREE.MeshPhysicalMaterial({
          metalness: 0.2,
          roughness: 0.4,
          flatShading: false // This ensures smooth shading
        });
				const mesh1 = new THREE.Mesh( geometry1, material1 );

				scene.add( mesh1 );

      }

			function animate() {

				requestAnimationFrame( animate );

				controls.update();
				renderer.render( scene, camera );

			}