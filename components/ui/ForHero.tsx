import { LOGO_BASE64 } from "@/const/data";
import { FlickeringGrid } from "./flicker";

// Base64 encoded SVG - Square Experience Logo


// 定义遮罩样式 - 减小尺寸提高可读性
const maskStyle = {
  WebkitMaskImage: `url('${LOGO_BASE64}')`,
  WebkitMaskSize: "60vw", // 减小尺寸从100vw到60vw
  WebkitMaskPosition: "center",
  WebkitMaskRepeat: "no-repeat",
  maskImage: `url('${LOGO_BASE64}')`,
  maskSize: "60vw", // 减小尺寸从100vw到60vw
  maskPosition: "center",
  maskRepeat: "no-repeat",
} as const;

// 定义网格动画颜色和配置 - 更丰富的渐变色彩
const GRID_CONFIG = {
  background: {
    color: "#1E40AF", // 深蓝色背景
    maxOpacity: 0.2,
    flickerChance: 0.15,
    squareSize: 4,
    gridGap: 4,
  },
  logo: {
    color: "#F59E0B", // 金黄色主色调
    maxOpacity: 0.8,
    flickerChance: 0.25,
    squareSize: 3,
    gridGap: 6,
  },
} as const;

const FlickeringGridDemo = () => {
  return (
    <div className="flex w-full h-screen justify-center items-center">
      <FlickeringGrid
        className={`absolute inset-0 z-0 mask-[radial-gradient(1000px_circle_at_center,white,transparent)] motion-safe:animate-pulse`}
        {...GRID_CONFIG.background}
      />
      <div
        className="absolute inset-0 z-0 -translate-y-[27vh] motion-safe:animate-fade-in"
        style={{
          ...maskStyle,
          animation: "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        }}
      >
        <FlickeringGrid {...GRID_CONFIG.logo} />
      </div>
    </div>
  );
};

export { FlickeringGridDemo };
