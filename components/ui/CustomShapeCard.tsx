"use client";

import React from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CustomShapeCardProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  className?: string;
  actionStartColor?: string;
  actionEndColor?: string;
  shape?: "hexagon" | "circle" | "blob" | "shield" | "wavy";
  customPath?: string;
  viewBox?: string;
  imageUrl?: string;
  videoUrl?: string; // New prop for video
}

export const shapes = {
  hexagon: {
    path: "M106.5,8.8 c13.3-7.7,29.7-7.7,43,0 l83,47.9 c13.3,7.7,21.5,21.9,21.5,37.3 v95.9 c0,15.4-8.2,29.6-21.5,37.3 l-83,47.9 c-13.3,7.7-29.7,7.7-43,0 l-83-47.9 c-13.3-7.7-21.5-21.9-21.5-37.3 V94.1 c0-15.4,8.2-29.6,21.5-37.3 L106.5,8.8 z",
    viewBox: "0 0 256 256"
  },
  circle: {
    path: "circle", // Special flag
    viewBox: "0 0 256 256"
  },
  blob: {
    path: "M206.5,183.3c-20.5,22.8-54.3,27.5-86.4,22.3c-32-5.2-61.9-20.8-74.8-49.8c-12.8-29-5.1-66.2,19.2-88.7S128.5,33.9,160.5,39 s61.9,20.8,74.8,49.8C248.1,117.8,226.9,160.5,206.5,183.3z",
    viewBox: "0 0 256 256"
  },
  shield: {
    path: "M128,30 C128,30, 210,20, 210,20 C210,20, 210,80, 210,95 C210,150, 175,200, 128,215 C81,200, 46,150, 46,95 C46,80, 46,20, 46,20 C46,20, 128,30, 128,30 z",
    viewBox: "0 0 256 256"
  },
  wavy: {
    path: "M800 0C882.843 0 950 67.1573 950 150V240C950 302.886 911.3 356.732 856.418 379.026C851.665 380.956 851.665 389.044 856.418 390.974C911.3 413.268 950 467.114 950 530V620C950 702.843 882.843 770 800 770H150C67.1573 770 1.44998e-06 702.843 0 620V530C0 467.114 38.6993 413.268 93.5817 390.974C98.3342 389.044 98.3342 380.956 93.5817 379.026C38.6993 356.732 1.10068e-06 302.886 0 240V150C0 67.1573 67.1573 0 150 0H800Z",
    viewBox: "0 0 950 770"
  }
};

export default function CustomShapeCard({
  title,
  description,
  icon,
  className,
  actionStartColor = "#5494ff",
  actionEndColor = "#5494ff",
  shape = "hexagon",
  customPath,
  viewBox,
  imageUrl,
  videoUrl,
}: CustomShapeCardProps) {
  const shapeConfig = shapes[shape] || shapes.hexagon;
  const pathData = customPath || shapeConfig.path;
  const currentViewBox = viewBox || shapeConfig.viewBox;

  const uniqueId = React.useId();
  const clipPathId = `clip-${uniqueId.replace(/:/g, "")}`;
  const videoRef = React.useRef<HTMLVideoElement>(null);

  const handleMouseEnter = () => {
    if (videoRef.current) {
      videoRef.current.play().catch(e => console.log("Video play failed", e));
    }
  };

  const handleMouseLeave = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };
  
  return (
    <div
      className={cn(
        "group relative w-full h-[650px]  overflow-hidden  bg-[var(--sq-brand-white)] p-8 text-black transition-all duration-300  rounded-[3rem]",
        className
      )}
      style={{
        background: `linear-gradient(135deg, ${actionStartColor}, ${actionEndColor})`,
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Decorative background shape - abstract shape */ }
      <div className="flex flex-col  items-start justify-center space-y-8">
        {/* Shape Container */}
        <div className="relative flex mx-auto h-[300px] w-[300px] items-center justify-center">
          <svg 
            viewBox={currentViewBox} 
            className="absolute inset-0 h-full w-full text-black" 
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <clipPath id={clipPathId}>
                 {pathData === "circle" ? (
                  <circle cx="128" cy="128" r="128" />
                ) : (
                  <path d={pathData} />
                )}
              </clipPath>
            </defs>

            {/* If we have image or video, use foreignObject to render HTML content clipped by SVG path */}
            {(imageUrl || videoUrl) ? (
              <foreignObject x="0" y="0" width="100%" height="100%" clipPath={`url(#${clipPathId})`}>
                 <div className="relative w-full h-full">
                    {/* Image - Always visible initially, fades out if video is playing/hovered */}
                    {imageUrl && (
                      <img 
                      src={imageUrl} 
                      alt="" 
                      className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${videoUrl ? 'group-hover:opacity-0' : ''}`} 
                      />
                    )}

                    {/* Video - Hidden initially, fades in on hover */}
                    {videoUrl && (
                      <video
                        ref={videoRef}
                        muted
                        loop
                        playsInline
                        className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                        src={videoUrl}
                      />
                    )}
                 </div>
              </foreignObject>
            ) : (
             pathData === "circle" ? (
                <circle cx="128" cy="128" r="128" />
              ) : (
                <path d={pathData} />
              )
            )}
          </svg>
          
          {/* Icon fallback if no media */}
          {!imageUrl && !videoUrl && (
            <div className="z-10 text-white">
              {icon}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="w-full space-y-4 text-start">
          <h3 className="text-3xl font-bold tracking-tight text-black dark:text-black">
            {title}
          </h3>
          <p className=" max-w-[280px] text-lg font-medium leading-relaxed text-black/70 dark:text-black/70">
            {description}
          </p>
        </div>

        {/* Action Button */}
        <button className="group mt-[50px] inline-flex items-center gap-2 rounded-full  bg-black px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-black/80">
          Try It Now
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
}
