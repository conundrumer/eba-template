import ReactDOM from "react-dom";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { providers } from "ethers";
import CustomStyle, { styleMetadata } from "./CustomStyle";
const defaultParams = styleMetadata.options;

const localBlocks = [
  "b0.json",
  "b1.json",
  "b2.json",
  "b3.json",
  "b4.json",
  "b5.json",
  "b6.json",
  "b7.json",
];

const provider = new providers.AlchemyProvider(
  null,
  "386SsqKCFuk0UONjXkN2etZ0fMJERGBr"
);

let initBlock = {
  blockId: "api",
  blockNumber: -1,
};
{
  const blockState = window.sessionStorage.getItem("STATE_BLOCK");
  if (blockState) {
    initBlock = JSON.parse(blockState);
  }
}
const initParams = { ...defaultParams };
{
  const paramsState = window.sessionStorage.getItem("STATE_PARAMS");
  if (paramsState) {
    const savedParams = JSON.parse(paramsState);
    for (let k in initParams) {
      if (k in savedParams) {
        initParams[k] = savedParams[k];
      }
    }
  }
}
function apiToEba(block) {
  const fixBigNumber = (object) => {
    for (let key in object) {
      const value = object[key];
      if (value && typeof value === "object" && value._hex) {
        object[key] = { hex: value._hex };
      }
    }
  };
  fixBigNumber(block);
  for (let tx of block.transactions) {
    fixBigNumber(tx);
  }
  return block;
}
const App = () => {
  const [blocks, setBlocks] = useState({});
  const [latestBlockNumber, setLatestBlockNumber] = useState(-1);
  const [nextRandoms, setNextRandoms] = useState([-1, -1]);
  const [blockNumber, _setBlockNumber] = useState(initBlock.blockNumber);
  const [blockId, setBlockId] = useState(initBlock.blockId);
  const [params, _setParams] = useState(initParams);
  const [attributes, setAttributes] = useState({ attributes: [] });
  const [radius, setRadius] = useState(0);
  const [aspect, setAspect] = useState(1);
  const [animate, setAnimate] = useState(true);

  const block = blocks[blockId === "api" ? blockNumber : blockId];
  let width = radius;
  let height = radius;
  if (aspect < 1) {
    height /= aspect;
  } else {
    width *= aspect;
  }
  const apiDisabled = latestBlockNumber === -1 || blockId !== "api";

  const canvasContainerRef = useRef();
  const canvasRef = useRef();

  // attributesRef hack to make it properly update
  const attributesRef = useMemo(
    () => ({
      set current(fn) {
        setAttributes(fn());
      },
    }),
    []
  );

  const setParams = (k, v) => {
    _setParams((s) => {
      const params = { ...s };
      params[k] = v;
      return params;
    });
  };
  // preload blocks
  const setBlockNumber = (blockNumber, ...preloadNumbers) => {
    _setBlockNumber(blockNumber);

    const maybeGetBlock = (n) => {
      if (n > -1 && !(n in blocks)) {
        provider.getBlockWithTransactions(n).then((block) => {
          setBlocks((blocks) => ({ ...blocks, [n]: apiToEba(block) }));
        });
      }
    };

    maybeGetBlock(blockNumber);
    for (let preloadNumber of preloadNumbers) {
      maybeGetBlock(preloadNumber);
    }
  };

  // on mount
  useEffect(() => {
    for (let blockFilename of localBlocks) {
      fetch(blockFilename)
        .then((res) => res.json())
        .then((block) => {
          setBlocks((blocks) => ({ ...blocks, [blockFilename]: block }));
        });
    }

    provider.getBlockNumber().then((n) => {
      setLatestBlockNumber(n);
      setNextRandoms([(Math.random() * n) | 0, (Math.random() * n) | 0]);
      if (blockNumber === -1) {
        setBlockNumber(n, n - 1);
      } else {
        setBlockNumber(blockNumber);
      }
    });
  }, []);

  // save block
  useEffect(() => {
    if (blockId !== "api" || blockNumber > -1) {
      window.sessionStorage.setItem(
        "STATE_BLOCK",
        JSON.stringify({ blockId, blockNumber })
      );
    }
  }, [blockId, blockNumber]);

  // save params
  useEffect(() => {
    window.sessionStorage.setItem("STATE_PARAMS", JSON.stringify(params));
  }, [params]);

  // canvas container size
  useEffect(() => {
    const { width, height } =
      canvasContainerRef.current.getBoundingClientRect();
    let radius = (Math.min(width, height) * 0.7) | 0;
    setRadius(radius);
  }, [canvasContainerRef]);

  return (
    <div className="container">
      <div className="topbar">
        <div>
          <button
            onClick={() =>
              setBlockNumber(blockNumber - 1, blockNumber - 2, blockNumber - 3)
            }
            disabled={apiDisabled || blockNumber === -1}
          >
            &lt;
          </button>
          <button
            onClick={() =>
              setBlockNumber(
                blockNumber + 1,
                Math.min(latestBlockNumber, blockNumber + 2),
                Math.min(latestBlockNumber, blockNumber + 3)
              )
            }
            disabled={
              apiDisabled ||
              blockNumber >= latestBlockNumber ||
              blockNumber === -1
            }
          >
            &gt;
          </button>
          <button
            onClick={() => {
              provider.getBlockNumber().then((n) => {
                setLatestBlockNumber(n);
                setBlockId("api");
                setBlockNumber(n, n - 1);
              });
            }}
            disabled={apiDisabled}
          >
            &gt;&gt;
          </button>
          <button
            onClick={() => {
              const n = (Math.random() * latestBlockNumber) | 0;
              setBlockNumber(nextRandoms[0], nextRandoms[1], n);
              setNextRandoms([nextRandoms[1], n]);
            }}
            disabled={apiDisabled || latestBlockNumber === -1}
          >
            R
          </button>
          <button
            disabled={apiDisabled || latestBlockNumber === -1}
            onClick={() => {
              const n = parseInt(prompt("Go to block number"), 10);
              if (n > -1 && n <= latestBlockNumber) {
                setBlockNumber(n);
              }
            }}
          >
            G
          </button>
        </div>
        &nbsp;•&nbsp;
        <div>
          {["api", ...localBlocks].map((id) => (
            <button
              key={id}
              onClick={() => setBlockId(id)}
              disabled={id === blockId}
            >
              {id.replace(".json", "")}
            </button>
          ))}
        </div>
      </div>
      <div className="main">
        <div className="sidebar">
          <div className="widget">
            <small>block</small>
            <div className="mod-input">
              {blockId === "api" ? blockNumber : blockId}
            </div>
          </div>
          <div className="space"></div>
          {Object.keys(params).map((k) => {
            let inputs;
            if (k.startsWith("mod")) {
              const props = {
                min: 0,
                max: 1,
                step: 0.001,
                value: params[k],
                onInput: (e) => setParams(k, parseFloat(e.target.value)),
              };
              inputs = (
                <>
                  <input type="number" {...props} />
                  <input type="range" {...props} />
                </>
              );
            }
            if (k.startsWith("color") || k === "background") {
              inputs = (
                <>
                  <input
                    type="color"
                    value={params[k]}
                    onInput={(e) => setParams(k, e.target.value)}
                  />
                  {params[k]}
                </>
              );
            }
            if (inputs) {
              return (
                <div className="widget" key={k}>
                  <small>{k}</small>
                  <div className="mod-input">{inputs}</div>
                </div>
              );
            }
          })}
          <div className="space"></div>
          <div className="widget">
            <small>size</small>
            <div className="mod-input">
              <input
                type="number"
                min={2 ** 6}
                max={2 ** 10}
                step={1}
                value={radius}
                onInput={(e) => setRadius(parseInt(e.target.value))}
              />
              <input
                type="range"
                min={6}
                max={10}
                step="any"
                value={Math.log2(radius)}
                onInput={(e) =>
                  setRadius((2 ** parseFloat(e.target.value)) | 0)
                }
              />
            </div>
          </div>
          <div className="widget">
            <small>aspect</small>
            <div className="mod-input">
              <input
                type="number"
                min={0.5}
                max={2}
                step="any"
                value={aspect}
                onInput={(e) => setAspect(parseInt(e.target.value))}
              />
              <input
                type="range"
                min={-1}
                max={1}
                step="any"
                value={Math.log2(aspect)}
                onInput={(e) => setAspect(2 ** parseFloat(e.target.value))}
              />
            </div>
          </div>
          <div className="widget">
            <small>animate</small>
            <div>
              <input
                type="checkbox"
                checked={animate}
                onChange={(e) => setAnimate(e.target.checked)}
              />
            </div>
          </div>
          <div className="widget">
            <small>reset</small>
            <div>
              <button
                onClick={() => {
                  window.sessionStorage.removeItem("STATE_PARAMS");
                  _setParams(defaultParams);
                }}
              >
                params
              </button>
              <button
                onClick={() => {
                  window.sessionStorage.removeItem("STATE_BLOCK");
                  location.reload();
                }}
              >
                block
              </button>
            </div>
          </div>
          <div className="space"></div>
          <div className="widget">
            <small>attributes</small>
            {attributes.attributes.map(({ trait_type, value }) => (
              <div key={trait_type}>
                {trait_type}: {value}
              </div>
            ))}
          </div>
        </div>
        <div className="canvas-container" ref={canvasContainerRef}>
          {radius > 0 && block && (
            <CustomStyle
              width={width}
              height={height}
              block={block}
              canvasRef={canvasRef}
              attributesRef={attributesRef}
              animate={animate}
              {...params}
            />
          )}
        </div>
      </div>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById("root"));
