import { useState, useMemo} from 'react'
import { Canvas } from '@react-three/fiber'
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';
import { AccumulativeShadows, RandomizedLight, Center, Environment, OrbitControls, Extrude, Shape} from '@react-three/drei'
import { Lightformer } from '@react-three/drei'
import { EffectComposer, N8AO } from '@react-three/postprocessing'
import * as THREE from 'three';
import Controls from './Controls'
import curveGen from './CurveGen'
import * as CSG from '@react-three/csg'

export default function App() {
  const [cupParams, setCupParams] = useState({
    height: 89,
    radius: 40,
    wallThickness: 3,
  })

  const [waveSmoothing, setWaveSmoothing] = useState(0)

  const [wave1Params, setWave1Params] = useState({
      height: 3,
      width: 15,
      sharpness: 0, // value from 0 to 1 
      outwards: true,
      baseWaveType: 1, // 0 = Triangle | 1 = Elipsoid |  2 = Sinus
      mixedWaveType: 2 // 0 = Triangle | 1 = Elipsoid |  2 = Sinus
    })
  
  const [wave2Params, setWave2Params] = useState({
      height: 0.8,
      width: 3.5,
      sharpness: 0, // value from 0 to 1
      outwards: false, 
      baseWaveType: 2, // 0 = Triangle | 1 = Elipsoid |  2 = Sinus
      mixedWaveType: 1 // 0 = Triangle | 1 = Elipsoid |  2 = Sinus
    })

  const [toolParams, setToolParams] = useState({
      width: 20,
      thickness: 0.6,
      hole: true
    })


  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Controls 
        cupParams={cupParams} setCupParams={setCupParams} 
        wave1Params={wave1Params} setWave1Params={setWave1Params} 
        wave2Params={wave2Params} setWave2Params={setWave2Params} 
        waveSmoothing={waveSmoothing} setWaveSmoothing={setWaveSmoothing}
        toolParams={toolParams} setToolParams={setToolParams}  
      />

      <Canvas camera={{ position: [10, 10, 13], fov: 50 }} style={{ background: '#b9ccc0'}}>
        <group position={[0, -5, 0]}>
          <Cup cupParams={cupParams} wave1Params={wave1Params} wave2Params={wave2Params} waveSmoothing={waveSmoothing} toolParams={toolParams}/>
        </group>
        
        <ambientLight intensity={1.8} />
        <pointLight position={[15, 8, 6]} intensity={400}/>        
        <OrbitControls enablePan={false} enableZoom={true} enableRotate={true} minPolarAngle={0} maxPolarAngle={Math.PI/2} />
      </Canvas>
    </div>
  )
}

function Cup(props) {

  let height = props.cupParams.height/10
  let radius = props.cupParams.radius/10
  let wallThickness = props.cupParams.wallThickness/10

  let waveHeight1 = props.wave1Params.height/10
  let waveWidth1 = props.wave1Params.width/10
  let waveSharpness1 = props.wave1Params.sharpness / 100
  let outwards1 = props.wave1Params.outwards
  let baseWaveType1 =  props.wave1Params.baseWaveType
  let mixedWaveType1 =  props.wave1Params.mixedWaveType

  let waveHeight2 = props.wave2Params.height/10
  let waveWidth2 = props.wave2Params.width/10
  let waveSharpness2 = props.wave2Params.sharpness / 100
  let outwards2 = props.wave2Params.outwards
  let baseWaveType2 =  props.wave2Params.baseWaveType
  let mixedWaveType2 =  props.wave2Params.mixedWaveType

  let toolWidth = (Math.max((outwards1?waveHeight1:0), (outwards2?waveHeight2:0)) + props.toolParams.width/10)/1.5
  let toolHeight = props.cupParams.height/10
  let toolThickness = props.toolParams.thickness/100

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

  const cupProfile = []
  const toolProfile = []

  cupProfile.push(new THREE.Vector2(0, wallThickness))
  toolProfile.push(new THREE.Vector2(0, -toolWidth))
  // Generate the points on the sinus wave
  


  let curvePoints = curveGen(waveHeight1 * (outwards1?-1:1), waveWidth1, waveSharpness1, baseWaveType1, mixedWaveType1,
                              waveHeight2 * (outwards2?-1:1), waveWidth2, waveSharpness2, baseWaveType2, mixedWaveType2,
                              height, 0)

  for (let i = 0; i < curvePoints.x.length; i++) {
    cupProfile.push(new THREE.Vector2(curvePoints.x[i], curvePoints.y[i]));
    toolProfile.push(new THREE.Vector2(curvePoints.x[i], curvePoints.y[i]/1.8));
  }
  

  cupProfile.push(new THREE.Vector2(height, wallThickness))
  toolProfile.push(new THREE.Vector2(toolHeight, -toolWidth))

  const cupShape = new THREE.Shape( cupProfile );
  const toolShape = new THREE.Shape( toolProfile );

  // TOOL
  const extrudeSettingsTool1 = useMemo(
    () => ({
      steps: 1,
      depth: toolThickness*1.8029,
      bevelEnabled: false,
    }),
    [toolThickness]
  )


  let toolGeom = new THREE.ExtrudeGeometry(toolShape, extrudeSettingsTool1);


  // Create a new matrix for the shear transformation
  let shearMatrix = new THREE.Matrix4();

  // Define the amount of shearing
  let shearZ = -1.5;

  // Set the matrix to represent a shear transformation along all axes
  shearMatrix.set(
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, shearZ, 1, 0,
    0, 0, 0, 1
  );

  // Apply the shear transformation to the geometry
  toolGeom.applyMatrix4(shearMatrix);

  // position={[radius + 1, -height/2, radius*0.2]} rotation={[Math.PI, Math.PI*.75, -Math.PI/2]}
  toolGeom.rotateX(Math.PI*1.25);
  toolGeom.rotateY(Math.PI);
  toolGeom.rotateZ(-Math.PI/2);
  toolGeom.translate(radius + 1, -height/2, radius*0.2)

  
  let holeDiameter = 2
  let holeGeom = new THREE.CylinderGeometry(holeDiameter, holeDiameter, 10, 32);
  holeGeom.rotateX(Math.PI/2)
  holeGeom.rotateY(-Math.PI/15.915)
  holeGeom.scale(0.5, height/holeDiameter/3, 1);
  holeGeom.translate(radius + 1 + toolWidth, 0, 0);

  let cutOff = new THREE.BoxGeometry(10, 5, height*1.2)
  cutOff.rotateZ(-Math.PI/2)
  cutOff.rotateX(Math.PI/2)
  cutOff.rotateY(-Math.PI/15.915)
  cutOff.translate(radius + 1 + toolWidth + toolWidth + 1.5, 0, 1.5);



  return (
    <Center top>
      <mesh castShadow >
        <Extrude rotation={[0, 0, -Math.PI/2]} args={[cupShape, extrudeSettings1]} castShadow>
          <meshPhysicalMaterial color="white" metalness={0.2} roughness={0.4}  wireframe={false} clearcoat={0.5} clearcoatRoughness={0.1}/>
        </Extrude>

        <mesh>
          <meshNormalMaterial />
          <CSG.Geometry>
            <CSG.Base geometry={toolGeom} />
            {props.toolParams.hole && <CSG.Subtraction geometry={holeGeom}/>}
            <CSG.Subtraction geometry={cutOff}/>
          </CSG.Geometry>

          <meshPhongMaterial attach="material" color="pink" />
        </mesh>



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