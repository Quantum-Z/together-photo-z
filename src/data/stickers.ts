export const STICKER_GROUPS: { label: string; items: string[] }[] = [
  { label: "Love", items: ["❤️", "💖", "💕", "💗", "💓", "💞", "💘", "😍", "🥰", "😘", "💋", "💌"] },
  { label: "Hearts", items: ["🩷", "💛", "💚", "💙", "💜", "🖤", "🤍", "🧡", "❣️", "💟"] },
  { label: "Cute", items: ["🐻", "🐼", "🐰", "🐱", "🐶", "🐨", "🐣", "🦊", "🐹", "🐸", "🐧", "🦉"] },
  { label: "Flowers", items: ["🌸", "🌷", "🌹", "🌺", "🌼", "🌻", "💐", "🏵️", "🌿", "🍀"] },
  { label: "Stars", items: ["⭐", "🌟", "✨", "💫", "🌙", "☁️", "🌈", "⚡", "🔆", "🪐"] },
  { label: "Food", items: ["🍓", "🍒", "🍑", "🍰", "🧁", "🍩", "🍪", "🍬", "🍭", "🥤", "🧋", "🍦"] },
  { label: "Party", items: ["🎀", "🎈", "🎉", "🎊", "🎁", "🎂", "👑", "💎", "🕯️", "🎆"] },
  { label: "Faces", items: ["😊", "😎", "🥳", "😜", "🤗", "😇", "🥺", "😆", "😝", "🙈"] },
];

export const ALL_STICKERS = STICKER_GROUPS.flatMap((g) => g.items);
