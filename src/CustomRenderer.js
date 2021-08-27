import { hexWeiToEth, int32ToFloat, lerp, parseBigNumber } from "./utils";

export const styleMetadata = {
  options: {
    mod1: 0.5,
    mod2: 0.1,
    color1: "#ff0000",
    background: "#aaaaff",
  },
};

export default class CustomRenderer {
  /** @param {HTMLCanvasElement} canvas */
  constructor(canvas) {
    this.canvas = canvas;
  }
  update(props) {
    // throttle at frame rate since changing params occurs multiple times per frame
    if (this.throttle) {
      cancelAnimationFrame(this.raf);
      this.raf = requestAnimationFrame(() => this.update(props));
      return;
    }
    this.throttle = true;
    requestAnimationFrame(() => {
      this.throttle = false;
    });

    const {
      attributesRef,
      animate,
      width,
      height,
      block,
      rng,
      // params
      mod1,
      mod2,
      color1,
      background,
    } = props;

    // set attributes
    attributesRef.current = () => ({
      attributes: [
        {
          trait_type: "Foo",
          value: "Bar",
        },
        {
          display_type: "number",
          trait_type: "Transactions",
          value: block.transactions.length,
        },
      ],
    });

    // draw
    const ctx = this.canvas.getContext("2d");
    ctx.fillStyle = background;
    ctx.globalAlpha = 1;
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = color1;
    ctx.globalAlpha = mod2;

    for (let tx of block.transactions) {
      // random numbers from hash
      const [cx, cy] = parseBigNumber(tx.hash).map(int32ToFloat);

      // random numbers from rng
      const angle = 2 * Math.PI * rng.random();

      // number from tx amount
      const value = hexWeiToEth(tx.value);

      let r = Math.log1p(value) * 0.1 + 0.002;
      r = lerp(r, 0.002, mod1);

      ctx.beginPath();
      ctx.arc(
        cx * width,
        cy * height,
        r * Math.min(width, height),
        2 * Math.PI,
        false
      );
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(cx * width, cy * height);
      ctx.lineTo(
        (cx + r * Math.cos(angle)) * width,
        (cy + r * Math.sin(angle)) * height
      );
      ctx.stroke();
    }
  }
  destroy() {
    cancelAnimationFrame(this.raf);
  }
}
