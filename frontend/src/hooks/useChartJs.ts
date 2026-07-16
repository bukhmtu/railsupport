import { useEffect } from "react";

type ChartCallback = (Chart: typeof window.Chart) => void;

declare global {
  interface Window {
    Chart: any;
  }
}

export function useChartJs(cb: ChartCallback, deps: React.DependencyList): void {
  useEffect(() => {
    if (window.Chart) { cb(window.Chart); return; }
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js";
    s.onload = () => cb(window.Chart);
    document.head.appendChild(s);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
