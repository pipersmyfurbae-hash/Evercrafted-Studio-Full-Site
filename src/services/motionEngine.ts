import { createCanvas, loadImage } from 'canvas';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import path from 'path';

export async function generateMotion(
  renderImageUrl: string,
  motionType: 'rotation' | 'sway' | 'pulse',
  intensity: number,
  durationSeconds: number,
  fps: number
): Promise<string> {
  const framesDir = path.join(process.cwd(), 'temp', `motion-${Date.now()}`);
  fs.mkdirSync(framesDir, { recursive: true });

  const totalFrames = durationSeconds * fps;
  const canvas = createCanvas(1080, 1080);
  const ctx = canvas.getContext('2d');
  const image = await loadImage(renderImageUrl);

  for (let i = 0; i < totalFrames; i++) {
    ctx.clearRect(0, 0, 1080, 1080);
    ctx.save();
    ctx.translate(540, 540);

    const time = i / fps;

    if (motionType === 'rotation') {
      const angle = (i / totalFrames) * 360;
      ctx.rotate((angle * Math.PI) / 180);
    } else if (motionType === 'sway') {
      const amplitude = intensity * 0.2; // Mapping intensity to amplitude
      const rotationFactor = intensity * 0.05;
      const xOffset = Math.sin(time * 2) * amplitude;
      const rotation = Math.sin(time * 2) * rotationFactor;
      ctx.translate(xOffset, 0);
      ctx.rotate((rotation * Math.PI) / 180);
    }

    ctx.drawImage(image, -540, -540, 1080, 1080);
    ctx.restore();

    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(path.join(framesDir, `frame-${i}.png`), buffer);
  }

  const outputVideoPath = path.join(process.cwd(), 'temp', `output-${Date.now()}.mp4`);
  
  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(path.join(framesDir, 'frame-%d.png'))
      .inputFPS(fps)
      .videoCodec('libx264')
      .outputOptions('-pix_fmt yuv420p')
      .output(outputVideoPath)
      .on('end', () => {
        // In a real app, upload to storage and return URL
        resolve(outputVideoPath); 
      })
      .on('error', reject)
      .run();
  });
}
