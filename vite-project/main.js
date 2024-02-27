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

				scene.add( new THREE.AmbientLight( 0x666666, 1 ) );

				const light = new THREE.PointLight( 0xffffff, 5, 0, 0 );
				light.position.set( 0, -50, 100 );
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
        const segments = 50; // Define the number of segments for the circle
        
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
					steps: 100,
					bevelEnabled: false,
					extrudePath: closedSpline
				};


				const pts1 = []

				

        // CUP GENERATION
        const waveSegments = 500; // Define the number of segments for the wave
        pts1.push(new THREE.Vector2(0, wallThickness))
        // Generate the points on the sinus wave
        for (let i = 0; i <= waveSegments; i++) {
            const x = (i / waveSegments) * height;
            const y = Math.sin(x);
            pts1.push(new THREE.Vector2(x, y));
        }
        pts1.push(new THREE.Vector2(height, wallThickness))
        


				const shape1 = new THREE.Shape( pts1 );
				const geometry1 = new THREE.ExtrudeGeometry( shape1, extrudeSettings1 );
				const material1 = new THREE.MeshLambertMaterial( { color: 0xb00000, wireframe: false } );
				const mesh1 = new THREE.Mesh( geometry1, material1 );


        const wireframeGeometry = new THREE.EdgesGeometry(geometry1);
        const wireframeMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 1 });
        const wireframe = new THREE.LineSegments(wireframeGeometry, wireframeMaterial);


				scene.add( mesh1 );
        //mesh1.add(wireframe)


      }

			function animate() {

				requestAnimationFrame( animate );

				controls.update();
				renderer.render( scene, camera );

			}