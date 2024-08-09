import { invoke } from "@tauri-apps/api/tauri";

interface Tile {
    id: string;
    name: string;
    commandHistory: { text: string; color: string }[];
    children: Tile[];
    flexDirection: "row" | "column";
    flex: number;
}

const commands: Record<
    string,
    { color: string; action: (arg: string) => void }
> = {
    create: { color: "var(--gruvbox-green)", action: createTile },
    focus: { color: "var(--gruvbox-yellow)", action: focusTile },
    close: { color: "var(--gruvbox-red)", action: closeTile },
    list: { color: "var(--gruvbox-blue)", action: listTiles },
    setDirection: { color: "var(--gruvbox-purple)", action: setFlexDirection },
    adjustFlex: { color: "var(--gruvbox-aqua)", action: adjustFlexValue },
    id: { color: "var(--gruvbox-gray)", action: getID },
};

let rootTile: Tile = {
    id: "R",
    name: "root",
    commandHistory: [],
    children: [],
    flexDirection: "column",
    flex: 1,
};

let focusedTileId: string = "R";
const inputContainerElement = createInputContainer();

function findTile(id: string, currentTile: Tile = rootTile): Tile | null {
    if (currentTile.id === id) return currentTile;
    for (const child of currentTile.children) {
        const found = findTile(id, child);
        if (found) return found;
    }
    return null;
}

function createTile(name: string) {
    const parentTile = findTile(focusedTileId);
    if (!parentTile) {
        appendToFocusedTile(
            "Error: Parent tile not found",
            "var(--gruvbox-red)"
        );
        return;
    }
    /*
    if (findTile(name)) {
        appendToFocusedTile(
            `Error: Tile with name "${name}" already exists`,
            "var(--gruvbox-red)"
        );
        return;
    }
    */
    const newTile: Tile = {
        id: parentTile.id + "-" + name,
        name: name,
        commandHistory: [],
        children: [],
        flexDirection: "column",
        flex: 1,
    };

    parentTile.children.push(newTile);
    renderTiles();
}

function focusTile(tileId: string) {
    const tile = findTile(tileId);
    if (tile) {
        focusedTileId = tileId;
        renderTiles();
    } else {
        appendToFocusedTile(
            `Error: Tile "${tileId}" not found`,
            "var(--gruvbox-red)"
        );
    }
}

function closeTile(tileId: string) {
    function removeFromParent(parentTile: Tile): boolean {
        const index = parentTile.children.findIndex(
            (child) => child.id === tileId
        );
        if (index !== -1) {
            parentTile.children.splice(index, 1);
            return true;
        }
        return parentTile.children.some(removeFromParent);
    }

    if (tileId === "R") {
        appendToFocusedTile(
            "Error: Cannot close root tile",
            "var(--gruvbox-red)"
        );
        return;
    }

    if (removeFromParent(rootTile)) {
        if (focusedTileId === tileId) {
            focusedTileId = "root";
        }
        renderTiles();
    } else {
        appendToFocusedTile(
            `Error: Tile "${tileId}" not found`,
            "var(--gruvbox-red)"
        );
    }
}

function listTiles() {
    function getTileList(tile: Tile, depth: number = 0): string {
        let result = `${"  ".repeat(depth)}${tile.id}\n`;
        for (const child of tile.children) {
            result += getTileList(child, depth + 1);
        }
        return result;
    }

    const tileList = getTileList(rootTile);
    appendToFocusedTile(`Tile structure:\n${tileList}`, "var(--gruvbox-blue)");
}

function setFlexDirection(direction: string) {
    const tile = findTile(focusedTileId);
    if (tile) {
        if (direction === "row" || direction === "column") {
            tile.flexDirection = direction;
            renderTiles();
        } else {
            appendToFocusedTile(
                `Error: Invalid direction. Use 'row' or 'column'.`,
                "var(--gruvbox-red)"
            );
        }
    }
}

function adjustFlexValue(delta: string) {
    const tile = findTile(focusedTileId);
    if (tile) {
        const numDelta = parseInt(delta);
        if (!isNaN(numDelta)) {
            tile.flex = Math.max(1, tile.flex + numDelta);
            renderTiles();
        } else {
            appendToFocusedTile(
                `Error: Invalid flex adjustment value.`,
                "var(--gruvbox-red)"
            );
        }
    }
}

function getID() {
    appendToFocusedTile(
        `ID: ${findTile(focusedTileId)?.id}`,
        "var(--gruvbox-gray)"
    );
};

function renderTiles() {
    const container = document.getElementById("tiling-container");
    if (!container) {
        console.error("Tiling container not found!");
        return;
    }
    container.innerHTML = "";
    renderTile(rootTile, container);
    focusInput();
}

function renderTile(tile: Tile, container: HTMLElement) {
    const tileElement = document.createElement("div");
    tileElement.classList.add("tile");
    tileElement.id = getTileElementId(tile.id);
    tileElement.style.display = "flex";
    tileElement.style.flex = tile.flex.toString();

    const headerElement = document.createElement("div");
    headerElement.classList.add("tile-header");
    headerElement.textContent = tile.name;
    tileElement.appendChild(headerElement);

    const contentElement = document.createElement("div");
    contentElement.classList.add("tile-content");
    contentElement.style.display = "flex";
    contentElement.style.flexDirection = tile.flexDirection;
    contentElement.style.flex = "1";

    if (tile.children.length > 0) {
        tile.children.forEach((child) => renderTile(child, contentElement));
    } else {
        const outputElement = document.createElement("div");
        outputElement.classList.add("tile-output");

        const commandHistoryElement = document.createElement("div");
        commandHistoryElement.classList.add("command-history");
        updateCommandHistory(commandHistoryElement, tile.commandHistory);

        outputElement.appendChild(commandHistoryElement);
        contentElement.appendChild(outputElement);
    }

    tileElement.appendChild(contentElement);

    if (tile.id === focusedTileId) {
        tileElement.classList.add("focused");
        tileElement.appendChild(inputContainerElement);
    }

    container.appendChild(tileElement);
}

function createInputContainer() {
    const inputContainerElement = document.createElement("div");
    inputContainerElement.classList.add("input-container");

    const inputElement = document.createElement("input");
    inputElement.type = "text";
    inputElement.classList.add("command-input");

    const autocompleteElement = document.createElement("input");
    autocompleteElement.type = "text";
    autocompleteElement.classList.add("autocomplete");
    autocompleteElement.readOnly = true;

    inputContainerElement.appendChild(inputElement);
    inputContainerElement.appendChild(autocompleteElement);

    inputElement.addEventListener("input", handleInput);
    inputElement.addEventListener("keydown", handleKeyDown);

    return inputContainerElement;
}

function getTileElementId(tileId: string): string {
    return `tile-${tileId.replace(/[^a-zA-Z0-9-_]/g, "_")}`;
}

function updateCommandHistory(
    commandHistoryElement: HTMLDivElement,
    commandHistory: { text: string; color: string }[]
) {
    commandHistoryElement.innerHTML = "";
    commandHistory.forEach((entry) => {
        const entryElement = document.createElement("div");
        entryElement.className = "command-entry";
        entryElement.style.color = entry.color;
        entryElement.textContent = entry.text;
        commandHistoryElement.appendChild(entryElement);
    });
}

function appendToFocusedTile(text: string, color: string) {
    const focusedTile = findTile(focusedTileId);
    if (focusedTile) {
        focusedTile.commandHistory.push({ text, color });
        renderTiles();
        const outputElement = document.querySelector(
            `#${getTileElementId(focusedTileId)} .tile-output`
        ) as HTMLDivElement;
        if (outputElement) {
            outputElement.scrollTop = outputElement.scrollHeight;
        }
    }
}

function focusInput() {
    const inputElement = document.querySelector(
        ".focused .command-input"
    ) as HTMLInputElement;
    if (inputElement) {
        inputElement.focus();
    }
}

function handleInput(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const autocompleteElement =
        inputElement.nextElementSibling as HTMLInputElement;

    updateAutocomplete(inputElement.value, autocompleteElement);
    updateStyling(inputElement.value, inputElement, autocompleteElement);
}

function updateAutocomplete(
    input: string,
    autocompleteElement: HTMLInputElement
) {
    const matchingCommands = Object.keys(commands).filter((cmd) =>
        cmd.startsWith(input)
    );
    if (matchingCommands.length > 0 && input !== "") {
        autocompleteElement.value = matchingCommands[0];
    } else {
        autocompleteElement.value = "";
    }
}

function updateStyling(
    input: string,
    inputElement: HTMLInputElement,
    autocompleteElement: HTMLInputElement
) {
    const command = input.split(" ")[0];
    const style = commands[command] || { color: "var(--gruvbox-fg)" };
    inputElement.style.color = style.color;
    autocompleteElement.style.color = `${style.color}80`; // 50% opacity
}

async function handleKeyDown(event: KeyboardEvent) {
    const inputElement = event.target as HTMLInputElement;
    const autocompleteElement =
        inputElement.nextElementSibling as HTMLInputElement;

    if (event.key === "Tab") {
        event.preventDefault();
        if (autocompleteElement.value) {
            inputElement.value = autocompleteElement.value;
            updateAutocomplete(inputElement.value, autocompleteElement);
            updateStyling(
                inputElement.value,
                inputElement,
                autocompleteElement
            );
        }
    } else if (event.key === "Enter") {
        const input = inputElement.value;
        const [command, ...args] = input.split(" ");
        const commandColor = commands[command]?.color || "var(--gruvbox-fg)";
        appendToFocusedTile(`> ${input}`, commandColor);
        inputElement.value = "";
        autocompleteElement.value = "";

        if (commands[command]) {
            commands[command].action(args.join(" "));
        } else {
            try {
                const result: string = await invoke("handle_command", {
                    command: input,
                });
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

function init() {
    renderTiles();
    window.addEventListener("click", handleWindowClick);
}

init();
