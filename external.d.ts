declare module "three";

declare module "@splinetool/react-spline" {
  import * as React from "react";

  const Spline: React.ComponentType<{
    scene: string;
    className?: string;
  }>;

  export default Spline;
}

declare module "qrcode" {
  export type QRCodeToDataURLOptions = {
    errorCorrectionLevel?: "L" | "M" | "Q" | "H";
    margin?: number;
    width?: number;
    color?: {
      dark?: string;
      light?: string;
    };
  };

  export function toDataURL(
    text: string,
    options?: QRCodeToDataURLOptions,
  ): Promise<string>;
}
