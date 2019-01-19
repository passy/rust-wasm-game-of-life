import { Universe } from "rust-wasm-game-of-life";

const pre = document.getElementById("game-of-life-canvas");
const universe = Universe.new();
const renderLoop = () => {
    if (pre === null) return;
    pre.textContent = universe.render();
    universe.tick();

    requestAnimationFrame(renderLoop);
};

requestAnimationFrame(renderLoop);