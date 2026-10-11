# SandCLI

SandCLI is a JavaScript CLI program that lets you play with different materials and simulate sand from the terminal! Play with solids, liquids, gases, fire, and explosions, and watch how they react with each other.

## Quick start

Run it without installing:

```bash
npx sandcli-sim -n my_world
```

Or install it globally:

```bash
npm install -g sandcli-sim
sandcli -n my_world
```

Requires Node.js 20.11 or newer.

## Usage

```bash
sandcli <world>            # load a world
sandcli -n <world>         # create a new world
sandcli -n <world> --size large
```

| Option | Description |
| --- | --- |
| `-n, --new <name>` | Create a new world |
| `--size <size>` | `tiny`, `small`, `normal`, `large`, `giant`, or `WIDTHxHEIGHT` (e.g. `100x40`) |
| `-v, --verbose` | Print extra info |

Run `sandcli` with no arguments to pick a world from a list.

## Controls

- `WASD`: Moves the cursor around (You can also click to create a particle and move the mouse)
- `<` and `>` (Or `+` and `-`): Cycles the selected tab
- Left and right arrow keys (Or `[` and `]`): Cycles the selected material
- Space/Enter: Place the selected material (Or clicking)
- `P`: Pause/unpause
- `R`: Resets the world

## Features

- Solids, liquids, and gases
- Fire and explosions
- Reactions between materials
- Basic machines
- Autosaves every 5 seconds

## Worlds

Worlds are saved as `.sw` files in `~/.sandcli/worlds` by default.

## Running from source

```bash
git clone https://github.com/sevinatenine/SandCLI
cd SandCLI
npm install
node src/main.js -n first_world
```

## License

MIT license. See [LICENSE.md](./LICENSE.md)