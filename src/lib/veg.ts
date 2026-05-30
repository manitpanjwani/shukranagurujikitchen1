import { useEffect, useState } from "react";

const KEY = "sgk-veg-mode";
const EVT = "veg:changed";

function read(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

export function setVegMode(on: boolean) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, on ? "1" : "0");
  window.dispatchEvent(new Event(EVT));
}

export function useVegMode(): [boolean, (v: boolean) => void] {
  const [on, setOn] = useState(false);
  useEffect(() => {
    setOn(read());
    const fn = () => setOn(read());
    window.addEventListener(EVT, fn);
    window.addEventListener("storage", fn);
    return () => {
      window.removeEventListener(EVT, fn);
      window.removeEventListener("storage", fn);
    };
  }, []);
  return [on, setVegMode];
}
