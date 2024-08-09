# YOSHO

personal shell playground project

```bash
# dev
npm run tauri dev

# build
npm run tauri build
```

## 2024-08-09

### DONE:
---
commands:
- `setDirection [row | column]` set flex-direction
- `adjustFlex [delta]` flex += delta, minimum 1

data:
- tiles stored as tree with children[]

rendering:
- nodes are rendered as tree from root node (inefficient)
---

### REDO:
---
styling:
- restrict colors to commands/keywords instead of entire line
- gradient to fade out old command history
---

### TODO:
---
data:
- migrate from `interface Tile` to `class Tile` (further goal `class Node` and `class Tile`)
    - element: DOMelement <div class="tile">
    - children: Tile[]
    - parent: Tile, perhaps use relatives instead with parent as relative 0? means root self-refers
    - name: string
    - id: string (parent-id + delimiter + name)
- create `class Tree`
    - root: Tile
    - focus: Tile
    - input: input-container

commands:
- `create [name] [before | after]` => add before/after functionality (insert at index?)
- `close` => should recursively close focused tile and all children and remove DOM elements
    - current `close [name]` allows closing parent (loses focused node)
- `focus [name]` => move to named relative of current node. use special case for parent, e.g. "move .."
- `relatives` => list relatives of current node
- `alias [list | get | set] [function] [alias]` => alias command + options, e.g. `alias set "alias list" al`

rendering:
- scrap update queue idea, directly change DOM when needed using Tile.element
- add render modes:
    - `default`: show all headings + nesting
    - `no-head`: hide non-focused headers
    - `focused`: only show currently focused node
    - `sidebar`: show current node, and a flexed row/col list of children on choosable side
---

## 2024-08-01

### DONE:
---
commands:
- `create [name]` => make new node `name`
- `focus [name]` => focus existing node `name`
- `list` => list all existing nodes
- `close [name]` => close existing node `name`

data:
- nodes are stored as a simple list, making new nodes pushes to this list

rendering:
- nodes are rendered left to right following the list

styling:
- tiled windows
- autocomplete + coloring + colored history
- gradient to fade out old command history
---

### TODO:
---
data:
- `create [name]` should add to children of current node
- `close [name]` should recursively close all children
- implement movement commands, i.e. `move parent` or `move child-name`

rendering:
- only render focused node
- render focused node and all connected nodes, parent/children (zoom depth 1)
- try to render all nodes with some algo
- optimize rendering to only update changed nodes

mapping:
- generate and show a map of all nodes (in current node? in popup? as image?)
- show path to particular node name
---