"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import api, { handleApiError } from "@/lib/api";
import { API_ENDPOINTS } from "@/config/constants";
import { Room } from "@/types";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, loadUser, logout } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [activeRoom, setActiveRoom] = useState<Room | null>(null);
  const [loadingAction, setLoadingAction] = useState(false);

  useEffect(() => {
    const init = async () => {
      await loadUser();
      setIsLoading(false);
    };
    init();
  }, [loadUser]);

  // Fetch active room if user has one
  useEffect(() => {
    const fetchActiveRoom = async () => {
      if (user?.activeRoom) {
        try {
          // Handle activeRoom being either a string (ID) or an object
          const roomId =
            typeof user.activeRoom === "string"
              ? user.activeRoom
              : (user.activeRoom as any)._id;
          const response = await api.get(API_ENDPOINTS.GET_ROOM(roomId));
          setActiveRoom(response.data.data);
        } catch (error) {
          console.error("Failed to fetch active room:", error);
        }
      } else {
        setActiveRoom(null);
      }
    };
    fetchActiveRoom();
  }, [user?.activeRoom]);

  const handleCloseRoom = async () => {
    if (!activeRoom) return;

    setLoadingAction(true);
    try {
      await api.delete(API_ENDPOINTS.CLOSE_ROOM(activeRoom._id));
      await loadUser(); // Refresh user data
      setActiveRoom(null);
    } catch (error) {
      alert(handleApiError(error));
    } finally {
      setLoadingAction(false);
    }
  };

  const handleRejoinRoom = () => {
    if (activeRoom) {
      router.push(`/room/${activeRoom._id}`);
    }
  };

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Background effects */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_80%_at_20%_-20%,_rgba(120,119,198,0.18),_transparent)]" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_80%_at_80%_120%,_rgba(255,107,157,0.18),_transparent)]" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_600px_at_50%_40%,_rgba(139,92,246,0.06),_transparent)]" />

      <div className="relative z-10">
        {/* Navbar */}
        <nav className="border-b border-white/10 bg-black/30 backdrop-blur-xl">
          <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
            <Link href="/" className="group flex items-center gap-3 transition-transform duration-300 hover:scale-105">
              <img
                src="/assets/logo_with_name.png"
                alt="Groovly"
                className="h-10 drop-shadow-[0_0_12px_rgba(168,85,247,0.4)]"
              />
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-white/80 text-sm">Welcome, <span className="text-white font-semibold">{user?.name}</span></span>
              <button
                onClick={logout}
                className="px-4 py-2 rounded-xl border border-white/10 text-white/80 hover:bg-white/10 hover:text-white transition-all duration-300 text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </nav>

        {/* Main content */}
        <div className="mx-auto max-w-7xl px-6 py-12">
          {/* Active Room Banner */}
          {activeRoom && (
            <div className="mb-8 max-w-4xl mx-auto">
              <div className="glass-panel rounded-2xl p-6 border-purple-500/30 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400" />
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">
                      Active Room: {activeRoom.name}
                    </h3>
                    <p className="text-muted text-sm">
                      Code:{" "}
                      <span className="text-purple-400 font-mono font-bold">
                        {activeRoom.code}
                      </span>{" "}
                      • {activeRoom.memberCount} members
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleRejoinRoom}
                      className="px-6 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:from-purple-500 hover:to-pink-500 transition-all shadow-lg shadow-purple-500/25"
                    >
                      Rejoin Room
                    </button>
                    <button
                      onClick={handleCloseRoom}
                      disabled={loadingAction}
                      className="px-6 py-2 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-50"
                    >
                      {loadingAction ? "Closing..." : "Close Room"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="text-center mb-12">
            <h2 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-orange-400 mb-6 drop-shadow-sm tracking-tight">
              Ready to vibe?
            </h2>
            <p className="text-muted text-lg">
              {activeRoom
                ? "Close your current room to create a new one, or join another"
                : "Create a new room or join an existing one"}
            </p>
          </div>

          {/* Action cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Create Room Card */}
            <button
              onClick={() => !activeRoom && setShowCreateModal(true)}
              disabled={!!activeRoom}
              className={`group relative overflow-hidden rounded-3xl glass-panel p-12 text-left transition-all ${
                activeRoom
                  ? "opacity-50 cursor-not-allowed"
                  : "glass-panel-hover hover:border-purple-500/50"
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-500/20 text-purple-400">
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">
                  Create Room
                </h3>
                <p className="text-muted">
                  {activeRoom
                    ? "Close your active room first"
                    : "Start a new music session and invite your friends to join"}
                </p>
              </div>
            </button>

            {/* Join Room Card */}
            <button
              onClick={() => setShowJoinModal(true)}
              className="group relative overflow-hidden rounded-3xl glass-panel p-12 text-left glass-panel-hover hover:border-pink-500/50"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-full bg-pink-500/20 text-pink-400">
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">
                  Join Room
                </h3>
                <p className="text-muted">
                  Enter a room code to join an existing music session
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Create Room Modal */}
      {showCreateModal && (
        <CreateRoomModal onClose={() => setShowCreateModal(false)} />
      )}

      {/* Join Room Modal */}
      {showJoinModal && (
        <JoinRoomModal onClose={() => setShowJoinModal(false)} />
      )}
    </main>
  );
}

// Create Room Modal Component
function CreateRoomModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [roomName, setRoomName] = useState("");
  const [mode, setMode] = useState("democratic");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await api.post<{ success: boolean; data: Room }>(
        API_ENDPOINTS.CREATE_ROOM,
        {
          name: roomName,
          mode,
        }
      );

      if (response.data.success) {
        const roomId = response.data.data._id;
        router.push(`/room/${roomId}`);
      }
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md glass-panel rounded-3xl p-8">
        <h2 className="text-2xl font-bold text-white mb-6">Create New Room</h2>

        {error && (
          <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 p-3">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="roomName"
              className="block text-sm font-medium text-white mb-2"
            >
              Room Name
            </label>
            <input
              type="text"
              id="roomName"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              required
              maxLength={50}
              className="w-full px-4 py-3 rounded-lg bg-black/40 border border-white/10 text-white placeholder-muted focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="My Awesome Party"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-3">
              Room Mode
            </label>
            <div className="space-y-2">
              <label className="flex items-center p-3 rounded-lg border border-white/10 cursor-pointer hover:bg-white/5 transition">
                <input
                  type="radio"
                  name="mode"
                  value="democratic"
                  checked={mode === "democratic"}
                  onChange={(e) => setMode(e.target.value)}
                  className="mr-3"
                />
                <div>
                  <div className="text-white font-medium">Democratic</div>
                  <div className="text-sm text-muted">
                    Songs ordered by votes
                  </div>
                </div>
              </label>
              <label className="flex items-center p-3 rounded-lg border border-white/10 cursor-pointer hover:bg-white/5 transition">
                <input
                  type="radio"
                  name="mode"
                  value="dj-mode"
                  checked={mode === "dj-mode"}
                  onChange={(e) => setMode(e.target.value)}
                  className="mr-3"
                />
                <div>
                  <div className="text-white font-medium">DJ Mode</div>
                  <div className="text-sm text-muted">
                    Host controls queue order
                  </div>
                </div>
              </label>
              <label className="flex items-center p-3 rounded-lg border border-white/10 cursor-pointer hover:bg-white/5 transition">
                <input
                  type="radio"
                  name="mode"
                  value="auto-play"
                  checked={mode === "auto-play"}
                  onChange={(e) => setMode(e.target.value)}
                  className="mr-3"
                />
                <div>
                  <div className="text-white font-medium">Auto-play</div>
                  <div className="text-sm text-muted">First-in-first-out</div>
                </div>
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-lg border border-white/20 text-white hover:bg-white/10 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold hover:from-purple-600 hover:to-pink-600 transition disabled:opacity-50"
            >
              {isLoading ? "Creating..." : "Create Room"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Join Room Modal Component
function JoinRoomModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [roomCode, setRoomCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await api.post<{ success: boolean; data: Room }>(
        API_ENDPOINTS.JOIN_ROOM(roomCode.toUpperCase())
      );

      if (response.data.success) {
        const roomId = response.data.data._id;
        router.push(`/room/${roomId}`);
      }
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md glass-panel rounded-3xl p-8">
        <h2 className="text-2xl font-bold text-white mb-6">Join Room</h2>

        {error && (
          <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 p-3">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="roomCode"
              className="block text-sm font-medium text-white mb-2"
            >
              Room Code
            </label>
            <input
              type="text"
              id="roomCode"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              required
              maxLength={6}
              className="w-full px-4 py-3 rounded-lg bg-black/40 border border-white/10 text-white text-center text-2xl font-mono tracking-widest placeholder-muted focus:outline-none focus:ring-2 focus:ring-purple-500 uppercase"
              placeholder="ABC123"
            />
            <p className="mt-2 text-sm text-muted text-center">
              Enter the 6-character room code
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-lg border border-white/20 text-white hover:bg-white/10 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || roomCode.length !== 6}
              className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold hover:from-purple-600 hover:to-pink-600 transition disabled:opacity-50"
            >
              {isLoading ? "Joining..." : "Join Room"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
