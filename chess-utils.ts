// Chess utility functions

export interface Move {
  from: string;
  to: string;
  san: string;
  piece: string;
  captured?: string;
  promotion?: string;
}

export interface GameInfo {
  white: string;
  black: string;
  result: string;
  date?: string;
  event?: string;
  site?: string;
}

export function parsePgn(pgn: string): {
  gameInfo: GameInfo;
  moves: string[];
} | null {
  try {
    const lines = pgn.trim().split('\n');
    const gameInfo: GameInfo = {
      white: "Unknown",
      black: "Unknown", 
      result: "*"
    };
    
    let moveText = "";
    let inHeaders = true;
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      if (trimmedLine.startsWith('[') && trimmedLine.endsWith(']')) {
        if (inHeaders) {
          // Parse header
          const match = trimmedLine.match(/\[(\w+)\s+"([^"]+)"\]/);
          if (match) {
            const [, key, value] = match;
            switch (key.toLowerCase()) {
              case 'white':
                gameInfo.white = value;
                break;
              case 'black':
                gameInfo.black = value;
                break;
              case 'result':
                gameInfo.result = value;
                break;
              case 'date':
                gameInfo.date = value;
                break;
              case 'event':
                gameInfo.event = value;
                break;
              case 'site':
                gameInfo.site = value;
                break;
            }
          }
        }
      } else if (trimmedLine && !trimmedLine.startsWith('[')) {
        inHeaders = false;
        moveText += trimmedLine + " ";
      }
    }
    
    // Parse moves
    const moves = parseMoveText(moveText);
    
    return { gameInfo, moves };
  } catch (error) {
    console.error("Error parsing PGN:", error);
    return null;
  }
}

function parseMoveText(moveText: string): string[] {
  // Remove result and comments
  const cleanText = moveText
    .replace(/\{[^}]*\}/g, '') // Remove comments
    .replace(/\([^)]*\)/g, '') // Remove variations
    .replace(/[012/]+-[012/]+/g, '') // Remove result
    .replace(/\*/g, '') // Remove asterisk
    .trim();
  
  // Split by move numbers and extract moves
  const moves: string[] = [];
  const tokens = cleanText.split(/\s+/);
  
  for (const token of tokens) {
    if (token && !token.match(/^\d+\.$/)) {
      // It's a move, not a move number
      const cleanMove = token.replace(/[+#?!]*$/, ''); // Remove annotations
      if (cleanMove.match(/^[KQRBN]?[a-h]?[1-8]?x?[a-h][1-8](?:=[QRBN])?$|^O-O(?:-O)?$/)) {
        moves.push(cleanMove);
      }
    }
  }
  
  return moves;
}

export function squareToCoordinates(square: string): { file: number; rank: number } {
  const file = square.charCodeAt(0) - 'a'.charCodeAt(0);
  const rank = parseInt(square[1]) - 1;
  return { file, rank };
}

export function coordinatesToSquare(file: number, rank: number): string {
  return String.fromCharCode('a'.charCodeAt(0) + file) + (rank + 1);
}

export function isValidSquare(square: string): boolean {
  return /^[a-h][1-8]$/.test(square);
}

export function getSquareColor(square: string): "light" | "dark" {
  const { file, rank } = squareToCoordinates(square);
  return (file + rank) % 2 === 0 ? "dark" : "light";
}

export function flipSquare(square: string): string {
  const { file, rank } = squareToCoordinates(square);
  return coordinatesToSquare(7 - file, 7 - rank);
}

export function getInitialPosition(): string {
  return "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
}

export function isPromotion(from: string, to: string, piece: string): boolean {
  const { rank: fromRank } = squareToCoordinates(from);
  const { rank: toRank } = squareToCoordinates(to);
  
  return piece.toLowerCase() === 'p' && 
         ((fromRank === 6 && toRank === 7) || (fromRank === 1 && toRank === 0));
}

export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export function getMoveNotation(move: Move): string {
  return move.san;
}
