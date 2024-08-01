import { invoke } from "@tauri-apps/api/tauri";
import "./styles.css";

interface Tile {
    id: string;
    commandHistory: { text: string; color: string }[];
}

const commands: Record<string, { color: string; action: (arg: string) => void }> = {
    create: { color: "var(--gruvbox-green)", action: createTile },
    focus: { color: "var(--gruvbox-yellow)", action: focusTile },
    close: { color: "var(--gruvbox-red)", action: closeTile },
    list: { color: "var(--gruvbox-blue)", action: listTiles },
};

const tilingContainer = document.getElementById("tiling-container") as HTMLDivElement;

let tiles: Tile[] = [];
let focusedTileId: string | null = null;

function createTile(name: string) {
    if (!name) {
        appendToFocusedTile("Error: Tile name is required", "var(--gruvbox-red)");
        return;
    }
    if (tiles.some(tile => tile.id === name)) {
        appendToFocusedTile(`Error: Tile with name "${name}" already exists`, "var(--gruvbox-red)");
        return;
    }
    const tile: Tile = { id: name, commandHistory: [] };
    tiles.push(tile);
    renderTiles();
    focusTile(name);
}

function focusTile(tileId: string) {
    focusedTileId = tileId;
    renderTiles();
}

function closeTile(tileId: string) {
    tiles = tiles.filter(tile => tile.id !== tileId);
    if (focusedTileId === tileId) {
        focusedTileId = tiles.length > 0 ? tiles[tiles.length - 1].id : null;
    }
    renderTiles();
}

function listTiles() {
    const tileList = tiles.map(tile => tile.id).join(", ");
    appendToFocusedTile(`Available tiles: ${tileList}`, "var(--gruvbox-blue)");
}

function renderTiles() {
    tilingContainer.innerHTML = "";
    tiles.forEach(tile => {
        const tileElement = document.createElement("div");
        tileElement.className = "tile";
        tileElement.id = tile.id.replace(/[^a-zA-Z0-9-_]/g, '_');
        
        const headerElement = document.createElement("div");
        headerElement.className = "tile-header";
        headerElement.textContent = tile.id;
        
        const contentElement = document.createElement("div");
        contentElement.className = "tile-content";
        
        const outputElement = document.createElement("div");
        outputElement.className = "tile-output";
        
        const commandHistoryElement = document.createElement("div");
        commandHistoryElement.className = "command-history";
        tile.commandHistory.forEach(entry => {
            const entryElement = document.createElement("div");
            entryElement.className = "command-entry";
            entryElement.style.color = entry.color;
            entryElement.textContent = entry.text;
            commandHistoryElement.appendChild(entryElement);
        });
        
        outputElement.appendChild(commandHistoryElement);
        contentElement.appendChild(outputElement);
        
        if (tile.id === focusedTileId) {
            tileElement.classList.add("focused");
            const inputContainerElement = createInputContainer();
            contentElement.appendChild(inputContainerElement);
        }
        
        tileElement.appendChild(headerElement);
        tileElement.appendChild(contentElement);
        
        tilingContainer.appendChild(tileElement);
    });

    focusInput();
}

function createInputContainer() {
    const inputContainerElement = document.createElement("div");
    inputContainerElement.className = "input-container";
    
    const inputElement = document.createElement("input");
    inputElement.type = "text";
    inputElement.className = "command-input";
    
    const autocompleteElement = document.createElement("input");
    autocompleteElement.type = "text";
    autocompleteElement.className = "autocomplete";
    autocompleteElement.readOnly = true;
    
    inputContainerElement.appendChild(inputElement);
    inputContainerElement.appendChild(autocompleteElement);
    
    inputElement.addEventListener("input", handleInput);
    inputElement.addEventListener("keydown", handleKeyDown);

    return inputContainerElement;
}

function focusInput() {
    const inputElement = document.querySelector('.focused .command-input') as HTMLInputElement;
    if (inputElement) {
        inputElement.focus();
    }
}

function appendToFocusedTile(text: string, color: string) {
    if (focusedTileId) {
        const tile = tiles.find(t => t.id === focusedTileId);
        if (tile) {
            tile.commandHistory.push({ text, color });
            renderTiles();
            const outputElement = document.querySelector(`#${focusedTileId.replace(/[^a-zA-Z0-9-_]/g, '_')} .tile-output`) as HTMLDivElement;
            if (outputElement) {
                outputElement.scrollTop = outputElement.scrollHeight;
            }
        }
    }
}

function handleInput(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const autocompleteElement = inputElement.nextElementSibling as HTMLInputElement;
    
    updateAutocomplete(inputElement.value, autocompleteElement);
    updateStyling(inputElement.value, inputElement, autocompleteElement);
}

function updateAutocomplete(input: string, autocompleteElement: HTMLInputElement) {
    const matchingCommands = Object.keys(commands).filter((cmd) =>
        cmd.startsWith(input)
    );
    if (matchingCommands.length > 0 && input !== "") {
        autocompleteElement.value = matchingCommands[0];
    } else {
        autocompleteElement.value = "";
    }
}

function updateStyling(input: string, inputElement: HTMLInputElement, autocompleteElement: HTMLInputElement) {
    const command = input.split(" ")[0];
    const style = commands[command] || { color: "var(--gruvbox-fg)" };
    inputElement.style.color = style.color;
    autocompleteElement.style.color = `${style.color}80`; // 50% opacity
}

async function handleKeyDown(event: KeyboardEvent) {
    const inputElement = event.target as HTMLInputElement;
    const autocompleteElement = inputElement.nextElementSibling as HTMLInputElement;
    
    if (event.key === "Tab" && autocompleteElement.value) {
        event.preventDefault();
        inputElement.value = autocompleteElement.value;
        updateAutocomplete(inputElement.value, autocompleteElement);
        updateStyling(inputElement.value, inputElement, autocompleteElement);
    } else if (event.key === "Enter") {
        const input = inputElement.value;
        const [command, ...args] = input.split(" ");
        const commandColor = commands[command]?.color || "var(--gruvbox-fg)";
        appendToFocusedTile(`> ${input}`, commandColor);
        inputElement.value = "";
        autocompleteElement.value = "";

        if (commands[command]) {
            commands[command].action(args.join(" ")); // Join args to handle multi-word tile names
        } else {
            try {
                const result: string = await invoke('handle_command', { command: input });
                appendToFocusedTile(result, "var(--gruvbox-fg)");
            } catch (error) {
                appendToFocusedTile(`Error: ${error}`, "var(--gruvbox-red)");
            }
        }
    }
}

function handleWindowClick(event: MouseEvent) {
    if (!(event.target instanceof HTMLInputElement)) {
        focusInput();
    }
}

async function init() {
    createTile("root");
    window.addEventListener('click', handleWindowClick);
}

init();

export default {};