"use client";

import baseGsap from "gsap";
import { ScrollTrigger as BaseScrollTrigger } from "gsap/dist/ScrollTrigger";

export const gsap = baseGsap;
export const ScrollTrigger = BaseScrollTrigger;

const GSAP_PLUGINS_REGISTERED_KEY = "__square_gsap_plugins_registered__";

function registerGsapPlugins() {
  if (typeof window === "undefined") {
    return;
  }

  const typedWindow = window as Window & {
    [GSAP_PLUGINS_REGISTERED_KEY]?: boolean;
  };

  if (typedWindow[GSAP_PLUGINS_REGISTERED_KEY]) {
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  typedWindow[GSAP_PLUGINS_REGISTERED_KEY] = true;
}

registerGsapPlugins();

export function ensureGsapPlugins() {
  registerGsapPlugins();
}

export default gsap;
