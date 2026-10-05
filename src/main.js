const fs = require("fs");
const { Screen, Box } = require('@unblessed/node');

const screen = new Screen({ smartCSR: true });

const box = new Box({
  parent: screen,
  top: 'center',
  left: 'center',
  width: '50%',
  height: '50%',
  content: 'Hello World!',
  border: { type: 'line' },
  style: {
    fg: 'white',
    bg: 'blue',
    border: { fg: '#f0f0f0' }
  }
});

screen.key(['escape', 'q'], () => process.exit(0));
screen.render();