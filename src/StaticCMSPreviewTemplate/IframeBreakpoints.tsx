import React from "react";
import {
  DevicePhoneMobileIcon,
  DeviceTabletIcon,
  ComputerDesktopIcon,
  ArrowsPointingOutIcon,
} from "@heroicons/react/24/outline";

export type ScreenDimensions = {
  portrait: string;
  landscape: string;
};

export interface Breakpoint {
  name: string;
  icon: JSX.Element;
  screen: ScreenDimensions;
}

// TODO: Use Tailwindcss breakpoints https://tailwindcss.com/docs/responsive-design
export const IframeBreakpoints: Array<Breakpoint> = [
  {
    name: "iPhone SE",
    icon: <DevicePhoneMobileIcon strokeWidth={2} className="h-5 w-5" />,
    screen: {
      portrait: "w-[320px] h-[568px]",
      landscape: "w-[568px] h-[320px]",
    },
  },
  {
    name: "iPhone X",
    icon: <DevicePhoneMobileIcon strokeWidth={2} className="h-5 w-5" />,
    screen: {
      portrait: "w-[375px] h-[812px]",
      landscape: "w-[812px] h-[375px]",
    },
  },
  {
    name: "Galaxy Note 10",
    icon: <DevicePhoneMobileIcon strokeWidth={2} className="h-5 w-5" />,
    screen: {
      portrait: "w-[412px] h-[869px]",
      landscape: "w-[869px] h-[412px]",
    },
  },
  {
    name: "iPad Mini 2019",
    icon: <DeviceTabletIcon strokeWidth={2} className="h-5 w-5" />,
    screen: {
      portrait: "w-[768px] h-[1024px]",
      landscape: "w-[1024px] h-[768px]",
    },
  },
  {
    name: "iPad Pro",
    icon: <DeviceTabletIcon strokeWidth={2} className="h-5 w-5" />,
    screen: {
      portrait: "w-[1024px] h-[1366px]",
      landscape: "w-[1366px] h-[1024px]",
    },
  },
  {
    name: "SXGA (5:4)",
    icon: <ComputerDesktopIcon strokeWidth={2} className="h-5 w-5" />,
    screen: {
      portrait: "w-[1024px] h-[1280px]",
      landscape: "w-[1280px] h-[1024px]",
    },
  },
  {
    name: "FHD (16:9)",
    icon: <ComputerDesktopIcon strokeWidth={2} className="h-5 w-5" />,
    screen: {
      portrait: "w-[1920px] h-[1080px]",
      landscape: "w-[1080px] h-[1920px]",
    },
  },
  {
    name: "Full",
    icon: <ArrowsPointingOutIcon strokeWidth={2} className="h-5 w-5" />,
    screen: {
      portrait: "w-full h-[80vh]",
      landscape: "w-full h-[60vh]",
    },
  },
];

export const defaultScreenOrientation = IframeBreakpoints.filter((v) => {
  return v.name === "Full";
})[0].screen;
