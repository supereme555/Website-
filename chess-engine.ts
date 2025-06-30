// Chess engine integration utilities
// This would typically integrate with Stockfish.js or similar

export interface EngineAnalysis {
  evaluation: number;
  bestMove: string;
  principalVariation: string[];
  depth: number;
}

export interface EngineOptions {
  depth: number;
  engine: "stockfish17" | "stockfish17lite";
  showArrows?: boolean;
}

export class ChessEngine {
  private options: EngineOptions;

  constructor(options: EngineOptions) {
    this.options = options;
  }

  async analyzePosition(fen: string): Promise<EngineAnalysis> {
    // In a real implementation, this would communicate with Stockfish.js
    // For now, we'll return mock analysis
    
    return new Promise((resolve) => {
      setTimeout(() => {
        // Generate mock analysis based on position
        const evaluation = (Math.random() - 0.5) * 4; // Random eval between -2 and +2
        const bestMoves = ["Nf3", "e4", "d4", "Nc3", "Bb5", "0-0", "Qd2", "Re1"];
        const bestMove = bestMoves[Math.floor(Math.random() * bestMoves.length)];
        
        const principalVariation = [
          bestMove,
          bestMoves[Math.floor(Math.random() * bestMoves.length)],
          bestMoves[Math.floor(Math.random() * bestMoves.length)]
        ];

        resolve({
          evaluation,
          bestMove,
          principalVariation,
          depth: this.options.depth
        });
      }, 500); // Simulate analysis time
    });
  }

  async findBestMove(fen: string): Promise<string> {
    const analysis = await this.analyzePosition(fen);
    return analysis.bestMove;
  }

  setDepth(depth: number): void {
    this.options.depth = depth;
  }

  setEngine(engine: "stockfish17" | "stockfish17lite"): void {
    this.options.engine = engine;
  }

  stop(): void {
    // Stop any running analysis
  }
}

export function createEngine(options: Partial<EngineOptions> = {}): ChessEngine {
  const defaultOptions: EngineOptions = {
    depth: 15,
    engine: "stockfish17",
    showArrows: true,
    ...options
  };

  return new ChessEngine(defaultOptions);
}

export function evaluateMove(beforeEval: number, afterEval: number): {
  classification: string;
  centipawnLoss: number;
} {
  const centipawnLoss = Math.abs(afterEval - beforeEval) * 100;
  
  let classification: string;
  if (centipawnLoss <= 0) {
    classification = "Best";
  } else if (centipawnLoss <= 2) {
    classification = "Excellent";
  } else if (centipawnLoss <= 5) {
    classification = "Good";
  } else if (centipawnLoss <= 10) {
    classification = "Inaccuracy";
  } else if (centipawnLoss <= 20) {
    classification = "Mistake";
  } else {
    classification = "Blunder";
  }

  return { classification, centipawnLoss };
}
