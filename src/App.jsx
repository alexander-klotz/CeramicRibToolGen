import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { AccumulativeShadows, RandomizedLight, Center, Environment, OrbitControls, Extrude, Shape, Points} from '@react-three/drei'
import { Lightformer } from '@react-three/drei'
import { EffectComposer, N8AO } from '@react-three/postprocessing'
import * as THREE from 'three';
import Controls from './Controls'
import curveGen from './CurveGen'

export default function App() {
  const [cupParams, setCupParams] = useState({
    height: 50,
    radius: 20,
    wallThickness: 2,
  })

  const [wave1Params, setWave1Params] = useState({
      height: 2,
      width: 5,
      sharpness: 0, // value from 0 to 1 
    })
  
  const [wave2Params, setWave2Params] = useState({
      height: 2,
      width: 5,
      sharpness: 0, // value from 0 to 1 
    })

  /*
            <AccumulativeShadows temporal frames={20} color="#413249" colorBlend={0.5} opacity={0.5} scale={10} alphaTest={0.85}>
            <RandomizedLight amount={10} radius={5} ambient={0.2} position={[5, 3, 2]} bias={0.0001} />
          </AccumulativeShadows>
  */

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Controls cupParams={cupParams} setCupParams={setCupParams} wave1Params={wave1Params} setWave1Params={setWave1Params} wave2Params={wave2Params} setWave2Params={setWave2Params}/>
      <Canvas camera={{ position: [15, 15, 20], fov: 50 }} style={{ background: '#edfcf2'}}>
        <group position={[0, -0.65, 0]}>
          

          <Cup cupParams={cupParams} wave1Params={wave1Params} wave2Params={wave2Params}/>
        </group>
        
        <ambientLight intensity={3} />
        <pointLight position={[50, 30, 20]} intensity={20000}/>        
        <OrbitControls enablePan={false} enableZoom={true} enableRotate={true} minPolarAngle={0} maxPolarAngle={Math.PI/2} />
      </Canvas>
    </div>
  )
}

function Cup(props) {

  let height = props.cupParams.height/10
  let radius = props.cupParams.radius/10
  let wallThickness = props.cupParams.wallThickness/10

  const circlePoints = [];
  const segments = 100; // number of segments for the circle
  
  // Generate the points on the circle
  for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      circlePoints.push(new THREE.Vector3( height/2, Math.cos(theta) * radius,  Math.sin(theta) * radius));
       
  }
  circlePoints.pop() 
  
  // Create the spline
  const closedSpline = new THREE.CatmullRomCurve3(circlePoints);
  closedSpline.curveType = 'catmullrom';
  closedSpline.closed = true;

  const extrudeSettings1 = {
    steps: 100,
    extrudePath: closedSpline    
  };

  const pts1 = []

  const waveSegments = 500;
  pts1.push(new THREE.Vector2(0, wallThickness))
  // Generate the points on the sinus wave
  
  let waveHeight1 = props.wave1Params.height/10
  let waveWidth1 = props.wave1Params.width/10
  let waveSharpness1 = props.wave1Params.sharpness / 100

  let waveHeight2 = props.wave2Params.height/10
  let waveWidth2 = props.wave2Params.width/10
  let waveSharpness2 = props.wave2Params.sharpness / 100

  // TODO: add some way of invertING THE CURVE BY ADDING A MINUS
  let curvePoints = curveGen(waveHeight1 * -1, waveWidth1, waveSharpness1, waveHeight2, waveWidth2, waveSharpness2, height, 0)
  // change this so the x value is calculated
  
  
  for (let i = 0; i < curvePoints.x.length; i++) {
    pts1.push(new THREE.Vector2(curvePoints.x[i], curvePoints.y[i]));
  }
  
  pts1.push(new THREE.Vector2(height, wallThickness))

  // CREATE GEOMETRY AND MATERIAL

  const shape1 = new THREE.Shape( pts1 );
  return (
    <Center top>
      <mesh castShadow >
        <Extrude rotation={[0,0,-Math.PI/2]} args={[shape1, extrudeSettings1]} castShadow>
          <meshPhysicalMaterial color="white" metalness={0.2} roughness={0.4}  wireframe={false} clearcoat={0.5} clearcoatRoughness={0.1}/>
        </Extrude>
      </mesh>
    </Center>
  )
}


function Env() {
  return       (
    <>
      <EffectComposer disableNormalPass multisampling={8}>
      <N8AO distanceFalloff={0.1} aoRadius={1} intensity={4} />
      </EffectComposer>
      <Environment resolution={256}>
        <group rotation={[-Math.PI / 3, 0, 1]}>
          <Lightformer form="circle" intensity={4} rotation-x={Math.PI / 2} position={[0, 5, -9]} scale={2} />
          <Lightformer form="circle" intensity={2} rotation-y={Math.PI / 2} position={[-5, 1, -1]} scale={2} />
          <Lightformer form="circle" intensity={2} rotation-y={Math.PI / 2} position={[-5, -1, -1]} scale={2} />
          <Lightformer form="circle" intensity={2} rotation-y={-Math.PI / 2} position={[10, 1, 0]} scale={8} />
        </group>
      </Environment>
    </>

  )
}