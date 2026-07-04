import clsx, { ClassValue } from "clsx";

export const cn = (...a: ClassValue[]) => clsx(a);

export const roomCode = () => {
  const yr = new Date().getFullYear();
  const rnd = Math.floor(1000 + Math.random() * 9000);
  return `${yr}-${rnd}`;
};

export const todayStr = () =>
  new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

export const inviteLink = (roomId: string) =>
  typeof window === "undefined" ? "" : `${window.location.origin}/?room=${encodeURIComponent(roomId)}`;
