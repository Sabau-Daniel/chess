<template>
  <div class="container">
    <div class="top mt-10">
      <v-btn @click="sendMessage">Default message</v-btn>
    </div>

    <div class="mid mt-10">
      <v-text-field
        variant="outlined"
        placeholder="Placeholder"
        v-model="valuish"
        hide-details
        class="ma-1 mr-10"
      />
      <v-btn @click="submit(valuish)" class="ma-1">Submit</v-btn>
    </div>

    <!-- Chess board -->
    <div class="chess-wrapper">
      <div id="board1"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import api from "./api/apiCall";

import { Chess } from "chess.js";
import Chessboard from "chessboardjs";

const valuish = ref("");

// Chess
const game = new Chess();
let board: any = null;
let selectedSquare: string | null = null;

function onDragStart(source: string) {
  console.log("source", source);
  let moves = game.moves({ square: source, verbose: true });
  let optionList = [];
  console.log("moves", moves);
  for (let option in moves) {
    console.log("option", moves[option].to);
    optionList.push(moves[option].to);
  }
  console.log("optionList", optionList);
  selectedSquare = source;
  clearHighlights();
  highlightSquare(source);
  highlightTargets(optionList);
}

function highlightSquare(square: string) {
  const el = document.querySelector(`.square-${square}`);
  if (el) el.classList.add("highlight");
}

function clearHighlights() {
  document
    .querySelectorAll(".highlight, .highlight-target")
    .forEach((el) => el.classList.remove("highlight", "highlight-target"));
}

function getLegalTargets(square: string): string[] {
  return game.moves({ square, verbose: true }).map((m: any) => m.to);
}

function highlightTargets(squares: string[]) {
  squares.forEach((sq) => {
    const el = document.querySelector(`.square-${sq}`);
    if (el) el.classList.add("highlight-target");
  });
}

function onSquareClick(e: Event) {
  const squareEl = e.currentTarget as HTMLElement;
  const square = squareEl.getAttribute("data-square");

  if (!square) return;

  console.log("square", square);

  // No selection yet → select if piece exists
  if (!selectedSquare) {
    const piece = game.get(square);
    if (!piece) return;

    selectedSquare = square;

    clearHighlights();
    highlightSquare(square);

    const targets = getLegalTargets(square);
    highlightTargets(targets);
    return;
  }

  // Click same square → deselect
  if (selectedSquare === square) {
    selectedSquare = null;
    clearHighlights();
    return;
  }

  // Try to move
  const move = game.move({
    from: selectedSquare,
    to: square,
    promotion: "q",
  });

  if (move) {
    board.position(game.fen());
  }

  // Reset selection
  selectedSquare = null;
  clearHighlights();
}

function getDelta(from: Square, to: Square) {
  const fileFrom = from.charCodeAt(0) - "a".charCodeAt(0);
  const rankFrom = parseInt(from[1], 10) - 1;

  const fileTo = to.charCodeAt(0) - "a".charCodeAt(0);
  const rankTo = parseInt(to[1], 10) - 1;

  return `X: ${fileTo - fileFrom}, Y: ${rankTo - rankFrom}`;
}

// ---------- CHESS INIT ----------

function onDrop(source: string, target: string) {
  if (source === target) {
    selectedSquare = null;
    clearHighlights();
    return "snapback";
  }

  const move = game.move({
    from: source,
    to: target,
    promotion: "q",
  });

  console.log("move", move.from, move.to);
  const coordinates = getDelta(move.from, move.to);
  console.log("new", coordinates);

  if (!move) {
    selectedSquare = null;
    clearHighlights();
    return "snapback";
  }

  selectedSquare = null;
  clearHighlights();
  board.position(game.fen());
  submit(coordinates);
}

onMounted(() => {
  board = Chessboard("board1", {
    draggable: true,
    position: "start",
    onDragStart,
    onDrop,
  });

  document.querySelectorAll("#board1 .square-55d63").forEach((squareEl) => {
    squareEl.addEventListener("click", onSquareClick);
  });
});

// --------------------------------

// Existing code (unchanged)
const submit = async (message: string) => {
  console.log("Submited: ", message);

  const response = await api("POST", "/send-message", {
    message: message,
  });
  console.log(response);
};

const sendMessage = async () => {
  const response = await api("POST", "/send-message", {
    message: "Default message",
  });

  console.log(response);
};
</script>

<style>
.container {
  min-width: 80vw;
  min-height: 80vh;
}

.top,
.mid {
  display: flex;
  justify-content: center;
  align-items: center;
}

.chess-wrapper {
  height: 50%;
  width: 50%;
}
</style>
