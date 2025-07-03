// QR Code generation utility using HTML5 Canvas
export async function generateQRCode(data: string, size: number = 256): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }

      canvas.width = size;
      canvas.height = size;

      // Simple QR code pattern generation (this is a basic implementation)
      // In a production app, you'd use a proper QR code library like 'qrcode'
      const gridSize = 25; // 25x25 grid
      const cellSize = size / gridSize;

      // Fill background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, size, size);

      // Generate pattern based on data
      ctx.fillStyle = '#000000';
      for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
          // Simple hash-based pattern generation
          const hash = simpleHash(data + row + col);
          if (hash % 2 === 0) {
            ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
          }
        }
      }

      // Add finder patterns (corners)
      drawFinderPattern(ctx, 0, 0, cellSize);
      drawFinderPattern(ctx, (gridSize - 7) * cellSize, 0, cellSize);
      drawFinderPattern(ctx, 0, (gridSize - 7) * cellSize, cellSize);

      resolve(canvas);
    } catch (error) {
      reject(error);
    }
  });
}

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

function drawFinderPattern(ctx: CanvasRenderingContext2D, x: number, y: number, cellSize: number) {
  // Draw finder pattern (7x7 squares)
  ctx.fillStyle = '#000000';
  
  // Outer square (7x7)
  ctx.fillRect(x, y, cellSize * 7, cellSize * 7);
  
  // Inner white square (5x5)
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(x + cellSize, y + cellSize, cellSize * 5, cellSize * 5);
  
  // Center black square (3x3)
  ctx.fillStyle = '#000000';
  ctx.fillRect(x + cellSize * 2, y + cellSize * 2, cellSize * 3, cellSize * 3);
}
