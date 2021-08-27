import React, { useEffect, useRef } from "react";
import MersenneTwister from "mersenne-twister";
import { parseBigNumber } from "./utils";
import CustomRenderer from "./CustomRenderer";

export { styleMetadata } from "./CustomRenderer";
// export const styleMetadata = {
//   options: {
//     mod1: 0,
//     mod2: 0.999,
//     color1: "#ff0000",
//     background: "#0000ff",
//   },
// };

const CustomStyle = (props) => {
  let { width, height, canvasRef, block } = props;
  // dimensions might be non-integers
  width = width | 0;
  height = height | 0;

  const rendererRef = useRef();

  // on mount
  useEffect(() => {
    rendererRef.current = new CustomRenderer(canvasRef.current);
  }, []);

  // on update
  useEffect(() => {
    const rng = new MersenneTwister(parseBigNumber(block.hash));
    rendererRef.current.update({ ...props, width, height, rng });
  })

  // on unmount
  useEffect(
    () => () => {
      rendererRef.current.destroy();
    },
    []
  );

  return React.createElement("canvas", {
    ref: canvasRef,
    width: width,
    height: height,
    style: { width, height },
  });
};
export default React.memo(CustomStyle);
