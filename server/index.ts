import { createServer } from "http";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const port = parseInt(process.env.PORT || "3000", 10);
const app = next({ dev });
const handle = app.getRequestHandler();

type User = { id: string; name: string; ready: boolean };
const rooms = new Map<string, Map<string, User>>();

const roomUsers = (roomId: string) =>
  Array.from(rooms.get(roomId)?.values() ?? []);

app.prepare().then(() => {
  const server = createServer((req, res) => handle(req, res));
  const io = new Server(server, { cors: { origin: "*" } });

  io.on("connection", (socket) => {
    let joinedRoom = "";

    socket.on("room:join", ({ roomId, name }: { roomId: string; name: string }) => {
      joinedRoom = roomId;
      socket.join(roomId);
      if (!rooms.has(roomId)) rooms.set(roomId, new Map());
      const map = rooms.get(roomId)!;
      const isHost = map.size === 0;
      map.set(socket.id, { id: socket.id, name, ready: false });

      socket.emit("room:joined", { selfId: socket.id, isHost });
      io.to(roomId).emit("room:users", roomUsers(roomId));
      // let existing peers know to initiate WebRTC toward the newcomer
      socket.to(roomId).emit("peer:new", { id: socket.id });
    });

    socket.on("room:config", (cfg) => {
      socket.to(joinedRoom).emit("room:config", cfg);
    });

    socket.on("room:ready", ({ ready }: { ready: boolean }) => {
      const u = rooms.get(joinedRoom)?.get(socket.id);
      if (u) u.ready = ready;
      io.to(joinedRoom).emit("room:users", roomUsers(joinedRoom));
    });

    // host-driven synchronized session
    socket.on("session:start", () => io.to(joinedRoom).emit("session:start"));
    socket.on("session:tick", (n: number) => socket.to(joinedRoom).emit("session:tick", n));
    socket.on("session:capture", (i: number) => socket.to(joinedRoom).emit("session:capture", i));
    socket.on("session:done", () => socket.to(joinedRoom).emit("session:done"));

    // WebRTC signaling relay
    socket.on("signal", ({ to, data }: { to: string; data: unknown }) => {
      io.to(to).emit("signal", { from: socket.id, data });
    });

    const leave = () => {
      const map = rooms.get(joinedRoom);
      if (map) {
        map.delete(socket.id);
        if (map.size === 0) rooms.delete(joinedRoom);
        else {
          // promote a new host if needed
          const users = roomUsers(joinedRoom);
          io.to(joinedRoom).emit("room:users", users);
          socket.to(joinedRoom).emit("peer:left", { id: socket.id });
        }
      }
    };

    socket.on("disconnect", leave);
    socket.on("room:leave", () => {
      socket.leave(joinedRoom);
      leave();
    });
  });

  server.listen(port, () => {
    console.log(`> Love Booth ready on http://localhost:${port}`);
  });
});
