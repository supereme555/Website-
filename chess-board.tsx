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
      } else if (boardState[square] && selectedSquare !== square) {
        // Select different piece
        setSelectedSquare(square);
        setPossibleMoves([]);
      } else {
        // Attempt move
        const moveSuccess = onMove?.(selectedSquare, square) || false;
        if (moveSuccess) {
          setSelectedSquare(null);
          setPossibleMoves([]);
        }
      }
    }
  };

  const handleDragStart = (e: React.DragEvent, square: string) => {
    if (!interactive || !boardState[square]) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData("text/plain", square);
    setSelectedSquare(square);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, toSquare: string) => {
    e.preventDefault();
    const fromSquare = e.dataTransfer.getData("text/plain");
    if (fromSquare && fromSquare !== toSquare) {
      const moveSuccess = onMove?.(fromSquare, toSquare) || false;
      if (moveSuccess) {
        setSelectedSquare(null);
        setPossibleMoves([]);
      }
    }
  };

  return (
    <div className="chess-board w-full max-w-2xl mx-auto aspect-square relative">
      {Array.from({ length: 8 }, (_, rank) =>
        Array.from({ length: 8 }, (_, file) => {
          const square = getSquareName(file, rank);
          const piece = boardState[square];
          const isLight = getSquareColor(file, rank) === "light";
          const isHighlighted = isSquareHighlighted(square);
          
          return (
            <div
              key={square}
              className={cn(
                "chess-square",
                isLight ? "light" : "dark",
                isHighlighted && getHighlightClass(square),
                interactive && "cursor-pointer"
              )}
              onClick={() => handleSquareClick(square)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, square)}
            >
              {piece && (
                <span
                  className="select-none text-4xl"
                  draggable={interactive}
                  onDragStart={(e) => handleDragStart(e, square)}
                >
                  {PIECES[piece]}
                </span>
              )}
              
              {/* Square coordinates (only on edges) */}
              {orientation === "white" && file === 0 && (
                <span className="absolute top-1 left-1 text-xs font-bold opacity-60">
                  {8 - rank}
                </span>
              )}
              {orientation === "white" && rank === 7 && (
                <span className="absolute bottom-1 right-1 text-xs font-bold opacity-60">
                  {FILES[file]}
                </span>
              )}
            </div>
          );
        })
      )}
      
      {/* Arrows overlay */}
      {arrows.length > 0 && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {arrows.map((arrow, index) => {
            // Calculate arrow positions based on squares
            const fromFile = FILES.indexOf(arrow.from[0]);
            const fromRank = parseInt(arrow.from[1]) - 1;
            const toFile = FILES.indexOf(arrow.to[0]);
            const toRank = parseInt(arrow.to[1]) - 1;
            
            const squareSize = 100 / 8; // Percentage
            const fromX = (orientation === "white" ? fromFile : 7 - fromFile) * squareSize + squareSize / 2;
            const fromY = (orientation === "white" ? 7 - fromRank : fromRank) * squareSize + squareSize / 2;
            const toX = (orientation === "white" ? toFile : 7 - toFile) * squareSize + squareSize / 2;
            const toY = (orientation === "white" ? 7 - toRank : toRank) * squareSize + squareSize / 2;
            
            return (
              <line
                key={index}
                x1={`${fromX}%`}
                y1={`${fromY}%`}
                x2={`${toX}%`}
                y2={`${toY}%`}
                stroke={arrow.color || "#f59e0b"}
                strokeWidth="3"
                markerEnd="url(#arrowhead)"
              />
            );
          })}
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon
                points="0 0, 10 3.5, 0 7"
                fill="#f59e0b"
              />
            </marker>
          </defs>
        </svg>
      )}
    </div>
  );
}
