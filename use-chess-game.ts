import { useState, useCallback } from "react";
import { Chess } from "chess.js";
import { parsePgn, getInitialPosition, type Move } from "@/lib/chess-utils";
import { createEngine, type EngineAnalysis } from "@/lib/chess-engine";

export interface ChessGameState {
  game: Chess | null;
  currentMove: number;
  totalMoves: number;
  moveHistory: Move[];
  position: string;
  evaluation: number;
  bestMove: string;
  principalVariation: string[];
  isLoading: boolean;
}

export function useChessGame() {
  const [game, setGame] = useState<Chess | null>(null);
  const [currentMove, setCurrentMove] = useState(0);
  const [moveHistory, setMoveHistory] = useState<Move[]>([]);
  const [evaluation, setEvaluation] = useState(0);
  const [bestMove, setBestMove] = useState("");
  const [principalVariation, setPrincipalVariation] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const engine = createEngine();

  const analyzePosition = useCallback(async (fen: string) => {
    try {
      const analysis = await engine.analyzePosition(fen);
      setEvaluation(analysis.evaluation);
      setBestMove(analysis.bestMove);
      setPrincipalVariation(analysis.principalVariation);
    } catch (error) {
      console.error("Analysis error:", error);
    }
  }, [engine]);

  const resetGame = useCallback(() => {
    const newGame = new Chess();
    setGame(newGame);
    setCurrentMove(0);
    setMoveHistory([]);
    setEvaluation(0);
    setBestMove("");
    setPrincipalVariation([]);
    analyzePosition(newGame.fen());
  }, [analyzePosition]);

  const loadPgn = useCallback((pgn: string): boolean => {
    try {
      const newGame = new Chess();
      const success = newGame.loadPgn(pgn);
      
      if (success) {
        const history = newGame.history({ verbose: true });
        
        // Reset to starting position and rebuild move history
        newGame.reset();
        const moves: Move[] = [];
        
        for (const move of history) {
          const gameMove = newGame.move(move);
          if (gameMove) {
            moves.push({
              from: gameMove.from,
              to: gameMove.to,
              san: gameMove.san,
              piece: gameMove.piece,
              captured: gameMove.captured,
              promotion: gameMove.promotion
            });
          }
        }
        
        // Reset to starting position for navigation
        newGame.reset();
        setGame(newGame);
        setMoveHistory(moves);
        setCurrentMove(0);
        analyzePosition(newGame.fen());
        
        return true;
      }
      return false;
    } catch (error) {
      console.error("PGN loading error:", error);
      return false;
    }
  }, [analyzePosition]);

  const goToMove = useCallback((moveNumber: number) => {
    if (!game || moveNumber < 0 || moveNumber > moveHistory.length) return;
    
    const newGame = new Chess();
    
    // Play moves up to the target move
    for (let i = 0; i < moveNumber; i++) {
      const move = moveHistory[i];
      try {
        newGame.move({ from: move.from, to: move.to, promotion: move.promotion });
      } catch (error) {
        console.error("Move error:", error);
        return;
      }
    }
    
    setGame(newGame);
    setCurrentMove(moveNumber);
    analyzePosition(newGame.fen());
  }, [game, moveHistory, analyzePosition]);

  const nextMove = useCallback(() => {
    if (currentMove < moveHistory.length) {
      goToMove(currentMove + 1);
    }
  }, [currentMove, moveHistory.length, goToMove]);

  const previousMove = useCallback(() => {
    if (currentMove > 0) {
      goToMove(currentMove - 1);
    }
  }, [currentMove, goToMove]);

  const firstMove = useCallback(() => {
    goToMove(0);
  }, [goToMove]);

  const lastMove = useCallback(() => {
    goToMove(moveHistory.length);
  }, [moveHistory.length, goToMove]);

  const makeMove = useCallback((from: string, to: string): boolean => {
    if (!game) return false;

    try {
      const move = game.move({ from, to });
      if (move) {
        const newMoveHistory = [...moveHistory.slice(0, currentMove), {
          from: move.from,
          to: move.to,
          san: move.san,
          piece: move.piece,
          captured: move.captured,
          promotion: move.promotion
        }];
        
        setMoveHistory(newMoveHistory);
        setCurrentMove(currentMove + 1);
        setGame(new Chess(game.fen()));
        analyzePosition(game.fen());
        
        return true;
      }
      return false;
    } catch (error) {
      console.error("Move error:", error);
      return false;
    }
  }, [game, moveHistory, currentMove, analyzePosition]);

  // Initialize with empty game
  useState(() => {
    resetGame();
  });

  return {
    game,
    currentMove,
    totalMoves: moveHistory.length,
    moveHistory,
    position: game?.fen() || getInitialPosition(),
    evaluation,
    bestMove,
    principalVariation,
    isLoading,
    
    // Actions
    loadPgn,
    goToMove,
    nextMove,
    previousMove,
    firstMove,
    lastMove,
    makeMove,
    reset: resetGame,
    analyzePosition
  };
}
