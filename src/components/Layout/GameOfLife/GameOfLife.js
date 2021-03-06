import React from "react";
import { Row, Button, ButtonGroup, Input } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Grid from "./Grid/Grid";
import Cell from "./Grid/Cell/Cell";
import Rules from "./Rules/Rules";

class GameOfLife extends React.Component {
  constructor(props) {
    super(props);
    this.rows = 30;
    this.columns = 40;
    this.grid = this.clearGrid();
    this.state = {
      //   rows: 30,
      //   columns: 40,
      cells: [],
      speed: 1000,
      isPlaying: false,
      generation: 0,
      cellColor: "#00FF00",
      gridColor: "#000"
    };
  }

  clearGrid() {
    let grid = [];

    for (let y = 0; y < this.rows; y++) {
      grid[y] = [];
      for (let x = 0; x < this.columns; x++) {
        grid[y][x] = false;
      }
    }

    return grid;
  }

  fillCells() {
    let cells = [];

    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.columns; x++) {
        if (this.grid[y][x]) {
          cells.push({ x, y });
        }
      }
    }

    return cells;
  }

  getCell() {
    return {
      x:
        this.gridRef.getBoundingClientRect().left +
        window.pageXOffset -
        document.documentElement.clientLeft,
      y:
        this.gridRef.getBoundingClientRect().top +
        window.pageYOffset -
        document.documentElement.clientTop
    };
  }

  handleClick = event => {
    const offsetX = event.clientX - this.getCell().x;
    const offsetY = event.clientY - this.getCell().y;
    const x = Math.floor(offsetX / 20);
    const y = Math.floor(offsetY / 20);

    if (x >= 0 && x <= this.columns && y >= 0 && y <= this.rows) {
      this.grid[y][x] = !this.grid[y][x];
    }

    this.setState({ cells: this.fillCells() });
  };

  startGame = () => {
    this.setState({ isPlaying: true });
    this.nextGeneration();
  };

  stopGame = () => {
    this.setState({ isPlaying: false });
    if (this.speedHandler) {
      window.clearTimeout(this.speedHandler);
      this.speedHandler = null;
    }
  };

  handleClear = () => {
    this.grid = this.clearGrid();
    this.setState({ cells: this.fillCells(), generation: 0 });
    this.stopGame();
  };

  handleRandom = () => {
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.columns; x++) {
        this.grid[y][x] = Math.random() >= 0.5;
      }
    }

    this.setState({ cells: this.fillCells() });
  };

  handleCellColor = event => {
    this.setState({ cellColor: event.target.value });
  };

  handleGridColor = event => {
    this.setState({ gridColor: event.target.value });
  };

  handleSpeed = event => {
    this.setState({ speed: event.target.value });
  };

  nextGeneration() {
    let generation = this.clearGrid();

    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.columns; x++) {
        let neighbors = this.applyRules(this.grid, x, y);
        if (this.grid[y][x]) {
          if (neighbors === 2 || neighbors === 3) {
            generation[y][x] = true;
          } else {
            generation[y][x] = false;
          }
        } else {
          if (!this.grid[y][x] && neighbors === 3) {
            generation[y][x] = true;
          }
        }
      }
    }

    this.grid = generation;
    this.setState(state => ({
      cells: this.fillCells(),
      generation: state.generation + 1
    }));

    this.speedHandler = window.setTimeout(() => {
      this.nextGeneration();
    }, (1 / this.state.speed) * 100000);
  }

  applyRules(grid, x, y) {
    let neighbors = 0;
    const directions = [
      [-1, -1],
      [-1, 0],
      [-1, 1],
      [0, 1],
      [1, 1],
      [1, 0],
      [1, -1],
      [0, -1]
    ];

    for (let i = 0; i < directions.length; i++) {
      const direction = directions[i];
      let y1 = y + direction[0];
      let x1 = x + direction[1];

      if (
        x1 >= 0 &&
        x1 < this.columns &&
        y1 >= 0 &&
        y1 < this.rows &&
        grid[y1][x1]
      ) {
        neighbors++;
      }
    }

    return neighbors;
  }

  render() {
    return (
      <Row>
        <Rules alive={this.state.cellColor} dead={this.state.gridColor} />
        <div>
          <h2>Generation: {this.state.generation}</h2>

          <Grid
            onClick={this.handleClick}
            ref={g => {
              this.gridRef = g;
            }}
            color={this.state.gridColor}
          >
            {this.state.cells.map(cell => (
              <Cell
                x={cell.x}
                y={cell.y}
                key={`${cell.x},${cell.y}`}
                color={this.state.cellColor}
              />
            ))}
          </Grid>
        </div>
        <div>
          <ButtonGroup>
            {this.state.isPlaying ? (
              <Button onClick={this.stopGame} size="lg">
                <FontAwesomeIcon icon="pause" /> Pause
              </Button>
            ) : (
              <Button onClick={this.startGame} size="lg">
                <FontAwesomeIcon icon="play" /> Play
              </Button>
            )}
            <Button onClick={this.handleClear} color="danger" size="lg">
              <FontAwesomeIcon icon="stop" /> Stop
            </Button>
            <Button onClick={this.handleRandom} size="lg">
              <FontAwesomeIcon icon="random" /> Random
            </Button>
          </ButtonGroup>
          <Input
            type="range"
            min="100"
            max="6000"
            value={this.state.speed}
            class="slider"
            onChange={this.handleSpeed}
          />
          {this.state.speed / 100} generation(s) per second
          <p>Cell color:</p>
          <Input
            type="color"
            value={this.state.cellColor}
            onChange={this.handleCellColor}
          />
          <p>Grid color:</p>
          <Input
            type="color"
            value={this.state.gridColor}
            onChange={this.handleGridColor}
          />
        </div>
      </Row>
    );
  }
}

export default GameOfLife;
