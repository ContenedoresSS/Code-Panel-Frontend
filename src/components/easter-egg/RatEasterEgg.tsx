import * as React from "react";
import { toast } from "sonner";

const SESSION_FLAG_KEY = "codepanel-rata-encontrada";
const CLICK_THRESHOLD = 5;
const RAT_TARGETS = ["[data-rat-logo]", "[data-rat-theme]"];

function isRatTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  return RAT_TARGETS.some((selector) => target.closest(selector));
}

export function RatEasterEgg() {
  const clickCountRef = React.useRef(0);

  React.useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (!isRatTarget(event.target)) return;

      clickCountRef.current += 1;
      if (clickCountRef.current < CLICK_THRESHOLD) return;

      clickCountRef.current = 0;

      if (sessionStorage.getItem(SESSION_FLAG_KEY)) return;

      sessionStorage.setItem(SESSION_FLAG_KEY, "1");
      toast("Dos ratas trabajaron aqui ᘛ⁐̤ᕐᐶ ᘛ⁐̤ᕐᐶ");
    };

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, []);

  return null;
}

export default RatEasterEgg;
