import { Universe, Cell } from "rust-wasm-game-of-life";
import { memory } from "rust-wasm-game-of-life/rust_wasm_game_of_life_bg";

const CELL_SIZE = 5; // px
const GRID_COLOR = "#CCCCCC";
const DEAD_COLOR = "#FFFFFF";
const ALIVE_COLOR = "#000000";

const universe = Universe.new();
const width = universe.width();
const height = universe.height();
const $canvas = document.querySelector("#game-of-life-canvas") as any;
const $playPause = document.querySelector("#play-pause");

const ctx = (() => {
    if ($canvas === null) return null;
    $canvas.height = (CELL_SIZE + 1) * height + 1;
    $canvas.width = (CELL_SIZE + 1) * width + 1;
    return $canvas.getContext('2d');
})();

interface State {
    animationId: number,
};

const globalState: State = { animationId: 0 };
const renderLoop = () => {
    universe.tick();
    
    drawGrid(ctx);
    drawCells(ctx);

    globalState.animationId = requestAnimationFrame(renderLoop);
};

const isPaused = (state: State) => state.animationId === 0;
const getIndex = (row: number, column: number) => row * width + column;

const play = () => {
    if ($playPause == null || !isPaused(globalState)) return;
    $playPause.textContent = "⏸";
    requestAnimationFrame(renderLoop);
}

const pause = () => {
    if ($playPause == null || isPaused(globalState)) return;
    $playPause.textContent = "▶";
    cancelAnimationFrame(globalState.animationId);
    globalState.animationId = 0;
}

const drawCells = (ctx: CanvasRenderingContext2D) => {
    const cellsPtr = universe.cells_ptr();
    const cells = new Uint8Array(memory.buffer, cellsPtr, width * height);

    ctx.beginPath();

    for (let row = 0; row < height; row++) {
        for (let col = 0; col < width; col++) {
            const idx = getIndex(row, col);

            ctx.fillStyle = cells[idx] === Cell.Dead
                ? DEAD_COLOR
                : ALIVE_COLOR;

            ctx.fillRect(
                col * (CELL_SIZE + 1) + 1,
                row * (CELL_SIZE + 1) + 1,
                CELL_SIZE,
                CELL_SIZE
            )
        }
    }

    ctx.stroke();
};

const drawGrid = (ctx: CanvasRenderingContext2D) => {
    ctx.beginPath();
    ctx.strokeStyle = GRID_COLOR;

    for (let i = 0; i <= width; i++) {
        ctx.moveTo(i * (CELL_SIZE + 1) + 1, 0);
        ctx.lineTo(i * (CELL_SIZE + 1) + 1, (CELL_SIZE + 1) * height + 1);
    }

    for (let j = 0; j <= height; j++) {
        ctx.moveTo(0, j * (CELL_SIZE + 1) + 1);
        ctx.lineTo((CELL_SIZE + 1) * width + 1, j * (CELL_SIZE + 1) + 1)
    }

    ctx.stroke();
};

const initEventHandlers = () => {
    if ($playPause !== null) {
        $playPause.addEventListener("click", _event => {
            if (isPaused(globalState)) {
                play();
            } else {
                pause();
            }
        });
    }

    if ($canvas !== null) {
        const $c: Element = $canvas;
        $c.addEventListener("click", (event: any) => {
            const boundingRect = $c.getBoundingClientRect();
            const scaleX = $canvas.width / boundingRect.width;
            const scaleY = $canvas.height / boundingRect.height;

            const canvasLeft = (event.clientX - boundingRect.left) * scaleX;
            const canvasTop = (event.clientY - boundingRect.top) * scaleY;

            const row = Math.min(Math.floor(canvasTop / (CELL_SIZE + 1)), height - 1);
            const col = Math.min(Math.floor(canvasLeft / (CELL_SIZE + 1)), width - 1);

            universe.toggle_cell(row, col);

            drawGrid(ctx);
            drawCells(ctx);
        });
    }
}

// Initialisation
drawGrid(ctx);
drawCells(ctx);
play();
initEventHandlers();