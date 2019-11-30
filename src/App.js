/*
    React-Three-Fiber example by Danny Bartsch
    In this example, we will set up an environment, with a ship model loaded. We will then apply
    a texture to it, and provide a starry background.
*/

import React, { Suspense, useRef } from "react";
/* Note: The currently active version of React does NOT work with React-Three-Fiber. You must
    specify a different version through package.json. This is currently using version
    ^0.0.0-experimental-5faf377df */

import * as THREE from "three";
import { GLTFLoader } from "./GLTFLoader.js";
import { Canvas, useFrame, useLoader } from "react-three-fiber";

import shipTexture from "./steelwall2.jpg";
import background from "./background2.png";
import shipmodel from "./ship3.glb";

function App() {
  console.log("Lets get moving...");

  /* Our app starts with a Three Canvas component. Note that Three primitives after that point are
        not PascalCased, but Canvas is capitalized. Within the Canvas declaration, we define our camera,
        and other properties.*/
  return (
    <div style={{ height: "95vh" }}>
      <Canvas camera={{ position: [0, 0, 15] }} shadowMap="true" style={{ backgroundColor: "black" }}>
        {/*Set up a light source. SpotLight shines in all directions from a single source */}
        <spotLight intensity={0.6} position={[30, 30, 50]} angle={0.2} penumbra={1} castShadow />

        {/* To render our ship, we need to provide a Suspense component first. From my
            understanding, generating the model isn't done on right away; it is 
            loaded asynchronously. Therefore, something must be provided until the
            model loading is complete. Null is suitable here, or another type of object
            can be used, too */}
        <Suspense fallback={null}>
          <MyShip />
        </Suspense>

        {/* Now show a starry background. Yes, we can pass props to our Three components,
                just like normal React! */}
        <StarryBackground texture={background} />
      </Canvas>
    </div>
  );
}

function StarryBackground(props) {
  // Start by setting up our texture.
  const texmgr = new THREE.TextureLoader();
  const texture = texmgr.load(props.texture);

  /* Since our sphere is so large, and the texture is not very detailed, we need
        to set up texture wrapping. You will probably notice the image looking mirrored 
        in some locations. The texture will also looked stretched at the corners; this is
        a product of using the sphere.*/
  texture.wrapS = texture.wrapT = THREE.MirroredRepeatWrapping;
  texture.repeat.set(5, 5);

  return (
    <mesh>
      <sphereBufferGeometry attach="geometry" args={[100, 64, 64]} />
      {/* Since our camera will sit INSIDE the sphere, the sphere cannot be seen with
                it, normally. We can change the side parameter to flip our mesh inside-out */}
      <meshBasicMaterial attach="material" map={texture} side={THREE.BackSide} />
    </mesh>
  );
}

function MyShip() {
  /* Start by calling useLoader. This will return an object, containing lots of data. GLTF is
        designed to provide a whole scene, so selecting your object within that scene may take
        some trial & error. For my ship, it was the 4th object.*/
  const gltf = useLoader(GLTFLoader, shipmodel);

  /* Next, we want to apply a texture to our ship. I was unable to load it directly through the
        GLTF model, but UV positioning is still preserved, so we can apply it manually.
        Textures are loaded through URL paths. Within a node.js environment, it is easier to import 
        such files instead of fetching them.*/
  const texmgr = new THREE.TextureLoader();
  const texture = texmgr.load(shipTexture);

  /* We want our object to rotate. In order to update our object after generating it, we need to
        create a reference to it. This reference can be attached to any component of our structure.
        We can then pass our function to useFrame.*/
  const Reference = useRef();
  useFrame(() => {
    Reference.current.rotation.x += 0.005;
    Reference.current.rotation.y += 0.005;
  });

  return (
    <mesh ref={Reference}>
      <bufferGeometry attach="geometry" {...gltf.__$[3].geometry} />
      {/* If seeing your model is an issue because of lighting, use meshBasicMaterial here
                instead. That material type ignores lighting all-together */}
      <meshStandardMaterial attach="material" map={texture} />
    </mesh>
  );
}

export default App;
