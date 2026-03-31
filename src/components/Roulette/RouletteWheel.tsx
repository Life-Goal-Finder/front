import { useRef, useState, useEffect, useCallback } from "react";
import { CategoryInterface } from "@/interfaces/Quest";
import { useTranslation } from "react-i18next";

interface RouletteWheelProps {
  categories: CategoryInterface[];
  isSpinning: boolean;
  onSpinEnd?: () => void;
  selectedIndex?: number;
  initialSize?: number;
}

export const RouletteWheel = ({
  categories,
  isSpinning,
  onSpinEnd,
  selectedIndex = 0,
  initialSize = 380,
}: RouletteWheelProps) => {
  const { i18n } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [size, setSize] = useState(initialSize);
  const [rotation, setRotation] = useState(0);
  const animationRef = useRef<number | undefined>(undefined);
  const startTimeRef = useRef<number | undefined>(undefined);

  const numSegments = categories.length || 8;
  const segmentAngle = (2 * Math.PI) / numSegments;

  // Default colors if no categories
  const defaultColors = [
    "#F25C54", "#FCE44D", "#FCD1E3", "#4CAF50",
    "#2196F3", "#9C27B0", "#FF9800", "#00BCD4",
  ];

  // Observe container width
  useEffect(() => {
    if (!containerRef.current) return;
    
    let debounceTimer: NodeJS.Timeout;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width } = entry.contentRect;
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          // Dynamic size: limit to 750px max, and take padding into account
          let newSize = Math.max(200, Math.min(width - 32, 750));
          // Make sure it also fits within the viewport height
          const vh = window.innerHeight;
          // Subtacting estimated header/footer, button height AND the result modal height
          const maxAllowedHeight = Math.max(200, vh - 450);
          if (newSize > maxAllowedHeight) {
            newSize = maxAllowedHeight;
          }
          setSize(newSize);
        }, 100);
      }
    });

    observer.observe(containerRef.current);
    return () => {
      observer.disconnect();
      clearTimeout(debounceTimer);
    };
  }, []);

  const drawWheel = useCallback((ctx: CanvasRenderingContext2D, currentRotation: number) => {
    const cx = size / 2;
    const cy = size / 2;
    const radius = size / 2 - 12;

    ctx.clearRect(0, 0, size, size);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(currentRotation);

    for (let i = 0; i < numSegments; i++) {
        const startAngle = i * segmentAngle;
        const endAngle = startAngle + segmentAngle;
        const color = categories[i]?.color || defaultColors[i % defaultColors.length];

        // Draw segment
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, radius, startAngle, endAngle);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();

        // Subtle border between segments
        ctx.strokeStyle = "rgba(0,0,0,0.2)";
        ctx.lineWidth = 1;
        ctx.stroke();

        // Draw label
        ctx.save();
        ctx.rotate(startAngle + segmentAngle / 2);
        ctx.textAlign = "center";
        
        const hexColor = color.replace('#', '');
        const r = parseInt(hexColor.substring(0, 2), 16) || 0;
        const g = parseInt(hexColor.substring(2, 4), 16) || 0;
        const b = parseInt(hexColor.substring(4, 6), 16) || 0;
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        
        ctx.fillStyle = luminance > 0.5 ? "#000000" : "#ffffff";
        ctx.font = `bold ${Math.max(11, Math.floor(size / 30))}px Inter, system-ui, sans-serif`;
        const libelleObj = categories[i]?.libelle;
        const labelStr = libelleObj ? ((libelleObj as any)[i18n.language] || (libelleObj as any).en) : `Slot ${i + 1}`;
        
        // Glitch effect while spinning
        let label = labelStr;
        if (isSpinning) {
          const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!?$&%@*#";
          label = labelStr.split("").map((c: string) => 
            c === " " ? " " : chars[Math.floor(Math.random() * chars.length)]
          ).join("");
        }

        const maxLen = Math.floor(radius / 10);
        const truncated = label.length > maxLen ? label.substring(0, maxLen) + "…" : label;
        ctx.fillText(truncated, radius * 0.6, 5);
        ctx.restore();
    }

    // Center circle
    ctx.beginPath();
    ctx.arc(0, 0, Math.max(15, size / 12), 0, Math.PI * 2);
    ctx.fillStyle = "#111";
    ctx.fill();
    ctx.strokeStyle = "var(--primary, #F25C54)";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Center icon
    ctx.fillStyle = "#fff";
    ctx.font = `bold ${Math.max(12, size / 24)}px Inter, system-ui`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("🎯", 0, 0);

    ctx.restore();

    // Pointer triangle
    ctx.beginPath();
    ctx.moveTo(size - 6, cy - (size / 25));
    ctx.lineTo(size - 6, cy + (size / 25));
    ctx.lineTo(size - (size / 10), cy);
    ctx.closePath();
    ctx.fillStyle = "#F25C54";
    ctx.fill();
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.stroke();
  }, [categories, numSegments, segmentAngle, size, i18n.language, isSpinning]);

  // Animation logic
  useEffect(() => {
    if (!isSpinning) return;

    const totalDuration = 4000; // 4s spin
    const startAngle = rotation; 

    // Calculate exact final angle purely forward
    const targetMod = (- (selectedIndex * segmentAngle + segmentAngle / 2)) % (Math.PI * 2);
    const posTargetMod = (targetMod + Math.PI * 2) % (Math.PI * 2);
    const startMod = startAngle % (Math.PI * 2);
    let diff = posTargetMod - startMod;
    if (diff <= 0) diff += Math.PI * 2;

    // Guaranteed integer full extra rotations (5 to 8)
    const extraRotations = (5 + Math.floor(Math.random() * 4)) * Math.PI * 2;
    const targetAngle = startAngle + diff + extraRotations;

    startTimeRef.current = performance.now();

    const animate = (time: number) => {
      const elapsed = time - (startTimeRef.current || 0);
      const progress = Math.min(elapsed / totalDuration, 1);

      // Cubic ease-out for smooth deceleration
      const eased = 1 - Math.pow(1 - progress, 3);
      const currentAngle = startAngle + eased * (targetAngle - startAngle);

      setRotation(currentAngle);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        onSpinEnd?.();
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
    // Include rotation at start via deps, but eslint might complain.
    // It purposefully relies on the cached `rotation` value at spin trigger.
  }, [isSpinning, selectedIndex, segmentAngle, onSpinEnd]);

  // Draw on every rotation change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Handle retina
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    // reset scale before setting to ensure we don't infinitely scale
    ctx.resetTransform();
    ctx.scale(dpr, dpr);

    drawWheel(ctx, rotation);
  }, [rotation, drawWheel, size]);

  return (
    <div ref={containerRef} className="relative flex items-center justify-center w-full min-h-[250px] max-w-full">
      {/* Outer glow ring */}
      <div
        className="absolute rounded-full"
        style={{
          width: size + (size * 0.06),
          height: size + (size * 0.06),
          background: `conic-gradient(from 0deg, var(--primary), transparent, var(--primary))`,
          opacity: isSpinning ? 0.6 : 0.2,
          filter: "blur(8px)",
          transition: "opacity 0.5s ease",
        }}
      />
      <canvas
        ref={canvasRef}
        className="relative z-10 drop-shadow-2xl"
        style={{ width: size, height: size }}
      />
    </div>
  );
};
