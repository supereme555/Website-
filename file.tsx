import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface ChessBoardProps {
  position: string; // FEN string
  onMove?: (from: string, to: string) => boolean;
  lastMove?: { from: string; to: string; san: string } | null;
  orientation?: "white" | "black";
  interactive?: boolean;
  highlightSquares?: string[];
  arrows?: Array<{ from: string; to: string; color?: string }>;
}

const PIECES: Record<string, string> = {
  'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙',
  'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟'
};

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'];

export function ChessBoard({
  position,
  onMove,
  lastMove,
  orientation = "white",
  interactive = true,
  highlightSquares = [],
  arrows = []
}: ChessBoardProps) {
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<string[]>([]);
  const [boardState, setBoardState] = useState<Record<string, string>>({});

  useEffect(() => {
    // Parse FEN to board state
    const [boardSection] = position.split(' ');
    const ranks = boardSection.split('/');
    const newBoardState: Record<string, string> = {};
    
    ranks.forEach((rank, rankIndex) => {
      let fileIndex = 0;
      for (const char of rank) {
        if (isNaN(parseInt(char))) {
          // It's a piece
          const square = FILES[fileIndex] + (8 - rankIndex);
          newBoardState[square] = char;
          fileIndex++;
        } else {
          // It's a number of empty squares
          fileIndex += parseInt(char);
        }
      }
    });
    
    setBoardState(newBoardState);
  }, [position]);

  const getSquareColor = (file: number, rank: number): "light" | "dark" => {
    return (file + rank) % 2 === 0 ? "dark" : "light";
  };

  const getSquareName = (file: number, rank: number): string => {
    const fileChar = orientation === "white" ? FILES[file] : FILES[7 - file];
    const rankChar = orientation === "white" ? RANKS[rank] : RANKS[7 - rank];
    return fileChar + rankChar;
  };

  const isSquareHighlighted = (square: string): boolean => {
    return (
      square === selectedSquare ||
      possibleMoves.includes(square) ||
      highlightSquares.includes(square) ||
      (lastMove && (lastMove.from === square || lastMove.to === square))
    );
  };

  const getHighlightClass = (square: string): string => {
    if (square === selectedSquare) return "selected";
    if (possibleMoves.includes(square)) return "highlighted";
    if (lastMove && (lastMove.from === square || lastMove.to === square)) return "highlighted";
    return "";
  };

  const handleSquareClick = (square: string) => {
    if (!interactive) return;

    if (selectedSquare === null) {
      // Select a piece
      if (boardState[square]) {
        setSelectedSquare(square);
        // In a real implementation, calculate possible moves here
        setPossibleMoves([]);
      }
    } else {
      if (selectedSquare === square) {
        // Deselect
        setSelectedSquare(null);
        setPossibleMoves([]);
