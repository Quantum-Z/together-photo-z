import clsx, { ClassValue } from "clsx";

export const cn = (...a: ClassValue[]) => clsx(a);

export const roomCode = () => {
  const yr = new Date().getFullYear();
  const rnd = Math.floor(1000 + Math.random() * 9000);
  return `${yr}-${rnd}`;
};

export const todayStr = () =>
  new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

// Always build the invite link from the CURRENT page origin so it is correct
// on localhost, Cloudflare Tunnel, Render, Railway, or any future domain.
// Never hardcode a host and never use the server URL.
export const inviteLink = (roomId: string) => {
  if (typeof window === "undefined") return "";
  // origin has no trailing slash; strip defensively in case of proxies.
  const origin = window.location.origin.replace(/\/+$/, "");
  return `${origin}/?room=${encodeURIComponent(roomId)}`;
};
