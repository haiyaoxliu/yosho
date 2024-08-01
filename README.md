# YOSHO

personal shell playground project

```bash
# dev
npm run tauri dev

# build
npm run tauri build
```

## 2024-08-01

### DONE:
---
commands:
- create [name] => make new node [name]
- focus [name] => focus existing node [name]
- list => list all existing nodes
- close [name] => close existing node [name]

data:
- nodes are stored as a simple list, making new nodes pushes to this list

rendering:
- nodes are rendered left to right following the list

styling:
- tiled windows
- autocomplete + coloring + colored history
- gradient to fade out old command history

### TODO:
---
data:
- create [name] should add to children of current node
- close [name] should recursively close all children
- implement movement commands, i.e. move [parent], move [childname]

rendering:
- only render focused node
- render focused node and all connected nodes, parent/children (zoom depth 1)
- try to render all nodes with some algo
- optimize rendering to only update changed nodes

mapping:
- generate and show a map of all nodes (in current node? in popup? as image?)
- show path to particular node name