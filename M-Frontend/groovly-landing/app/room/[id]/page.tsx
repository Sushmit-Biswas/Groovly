"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import api, { handleApiError } from "@/lib/api";
import socketService from "@/lib/socket";
import { API_ENDPOINTS, SOCKET_EVENTS } from "@/config/constants";
import { Room, Song, User } from "@/types";
import { useYouTubePlayer } from "@/hooks/useYouTubePlayer";
import Link from "next/link";

export default function RoomPage() {
  const router = useRouter();
  const params = useParams();
  const roomId = params.id as string;

  const { user, isAuthenticated, loadUser } = useAuthStore();
  const [room, setRoom] = useState<Room | null>(null);
  const [queue, setQueue] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddSong, setShowAddSong] = useState(false);

  // Check if current user is host
  const isHost =
    room &&
    user &&
    (typeof room.host === "string"
      ? room.host === user._id
      : room.host._id === user._id);

  // Fetch room data
  const fetchRoom = useCallback(async () => {
    try {
      const response = await api.get<{ success: boolean; data: Room }>(
        API_ENDPOINTS.GET_ROOM(roomId)
      );
      setRoom(response.data.data);
    } catch (err) {
      setError(handleApiError(err));
    }
  }, [roomId]);

  // Fetch queue
  const fetchQueue = useCallback(async () => {
    try {
      const response = await api.get<{ success: boolean; data: Song[] }>(
        API_ENDPOINTS.GET_ROOM_QUEUE(roomId)
      );
      setQueue(response.data.data);
    } catch (err) {
      console.error("Error fetching queue:", err);
    }
  }, [roomId]);

  // Initialize
  useEffect(() => {
    const init = async () => {
      await loadUser();
      await fetchRoom();
      await fetchQueue();
      setIsLoading(false);
    };
    init();
  }, [loadUser, fetchRoom, fetchQueue]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [isLoading, isAuthenticated, router]);

  // Socket.io setup
  useEffect(() => {
    if (!isAuthenticated || !roomId) return;

    const socket = socketService.connect();
    if (!socket) return;

    // Join room
    socket.emit(SOCKET_EVENTS.JOIN_ROOM, { roomId });

    // Listen for queue updates
    socket.on(SOCKET_EVENTS.QUEUE_UPDATED, (data) => {
      console.log("Queue updated:", data);
      fetchQueue();
    });

    // Listen for song updates
    socket.on(SOCKET_EVENTS.SONG_UPDATED, (data) => {
      console.log("Song updated:", data);
      setQueue((prev) =>
        prev.map((song) => (song._id === data.song._id ? data.song : song))
      );
    });

    // Listen for playback state
    socket.on(SOCKET_EVENTS.PLAYBACK_STATE, (data) => {
      console.log("Playback state:", data);
      setRoom((prev) =>
        prev
          ? {
              ...prev,
              playbackState: {
                ...prev.playbackState,
                isPlaying: data.isPlaying,
                position: data.position,
                lastUpdated: new Date().toISOString(),
              },
            }
          : null
      );
    });

    // Listen for song started
    socket.on(SOCKET_EVENTS.SONG_STARTED, (data) => {
      console.log("Song started:", data);
      fetchRoom();
      fetchQueue();
    });

    // Listen for member updates
    socket.on(SOCKET_EVENTS.MEMBER_JOINED, (data) => {
      console.log("Member joined:", data);
      fetchRoom();
    });

    socket.on(SOCKET_EVENTS.MEMBER_LEFT, (data) => {
      console.log("Member left:", data);
      fetchRoom();
    });

    // Listen for errors
    socket.on(SOCKET_EVENTS.ERROR, (data) => {
      console.error("Socket error:", data);
      setError(data.message);
    });

    // Listen for room closed
    socket.on(SOCKET_EVENTS.ROOM_CLOSED, async () => {
      alert("Room has been closed by the host");
      await loadUser(); // Force state refresh before navigating
      router.push("/dashboard");
    });

    // Cleanup
    return () => {
      socket.emit(SOCKET_EVENTS.LEAVE_ROOM, { roomId });
      socket.off(SOCKET_EVENTS.QUEUE_UPDATED);
      socket.off(SOCKET_EVENTS.SONG_UPDATED);
      socket.off(SOCKET_EVENTS.SONG_STARTED);
      socket.off(SOCKET_EVENTS.PLAYBACK_STATE);
      socket.off(SOCKET_EVENTS.MEMBER_JOINED);
      socket.off(SOCKET_EVENTS.MEMBER_LEFT);
      socket.off(SOCKET_EVENTS.ERROR);
      socket.off(SOCKET_EVENTS.ROOM_CLOSED);
    };
  }, [isAuthenticated, roomId, router, fetchQueue, fetchRoom]);

  // Handle leave room
  const handleLeaveRoom = async () => {
    try {
      await api.post(API_ENDPOINTS.LEAVE_ROOM(roomId));
      await loadUser(); // Force fresh user state to clear activeRoom
      router.push("/dashboard");
    } catch (err) {
      console.error("Error leaving room:", err);
    }
  };

  // Handle close room (host only)
  const handleCloseRoom = async () => {
    if (!confirm("Are you sure you want to close this room?")) return;

    try {
      await api.delete(API_ENDPOINTS.CLOSE_ROOM(roomId));
      await loadUser(); // Force fresh user state
      router.push("/dashboard");
    } catch (err) {
      setError(handleApiError(err));
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-white text-xl">Loading room...</div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="text-white text-xl mb-4">Room not found</div>
          <button
            onClick={() => router.push("/dashboard")}
            className="px-6 py-3 rounded-lg bg-purple-500 text-white hover:bg-purple-600 transition"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-black relative overflow-hidden">
      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_center,_rgba(139,92,246,0.12),_transparent_50%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(236,72,153,0.08),_transparent_60%)]" />

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-white/10 bg-black/50 backdrop-blur-sm">
          <div className="mx-auto max-w-7xl px-6 py-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-6">
                <Link href="/dashboard">
                  <img
                    src="/assets/logo_with_name.png"
                    alt="Groovly"
                    className="h-10 cursor-pointer hover:opacity-80 transition"
                  />
                </Link>
                <div className="h-8 w-px bg-white/20"></div>
                <div>
                  <h1 className="text-2xl font-bold text-white">{room.name}</h1>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-sm text-muted">
                      Code:{" "}
                      <span className="font-mono text-purple-400">
                        {room.code}
                      </span>
                    </span>
                    <span className="text-sm text-muted">•</span>
                    <span className="text-sm text-muted capitalize">
                      {room.mode.replace("-", " ")}
                    </span>
                    <span className="text-sm text-muted">•</span>
                    <span className="text-sm text-muted">
                      {room.members.length} members
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {isHost ? (
                  <button
                    onClick={handleCloseRoom}
                    className="px-4 py-2 rounded-lg border border-red-500/50 text-red-400 hover:bg-red-500/10 transition"
                  >
                    Close Room
                  </button>
                ) : (
                  <button
                    onClick={handleLeaveRoom}
                    className="px-4 py-2 rounded-lg border border-white/20 text-white hover:bg-white/10 transition"
                  >
                    Leave Room
                  </button>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Error message */}
        {error && (
          <div className="mx-auto max-w-7xl px-6 mt-4">
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          </div>
        )}

        {/* Main content */}
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Queue Section - Main */}
            <div className="lg:col-span-2 space-y-6">
              {/* Now Playing */}
              <NowPlaying
                room={room}
                isHost={!!isHost}
                queue={queue}
                user={user}
                fetchQueue={fetchQueue}
              />

              {/* Add Song Button */}
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Queue</h2>
                <button
                  onClick={() => setShowAddSong(true)}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium hover:from-purple-600 hover:to-pink-600 transition"
                >
                  + Add Song
                </button>
              </div>

              {/* Queue List */}
              <QueueList
                queue={queue}
                roomId={roomId}
                room={room}
                currentUserId={user?._id}
              />
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Room Members */}
              <MembersList
                members={room.members}
                hostId={
                  typeof room.host === "string" ? room.host : room.host._id
                }
              />
            </div>
          </div>
        </div>
      </div>

      {/* Add Song Modal */}
      {showAddSong && (
        <AddSongModal roomId={roomId} onClose={() => setShowAddSong(false)} />
      )}
    </main>
  );
}

// Now Playing Component
function NowPlaying({
  room,
  isHost,
  queue,
  user,
  fetchQueue,
}: {
  room: Room;
  isHost: boolean;
  queue: Song[];
  user: User | null;
  fetchQueue: () => Promise<void>;
}) {
  const currentSong = room.currentSong as Song | null;

  // Initialize YouTube Player for host
  const youtubePlayer = useYouTubePlayer(isHost, room._id);

  // Track playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isDraggingSlider, setIsDraggingSlider] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);
  const songEndedHandledRef = useRef(false);
  const lastPlayedSongIdRef = useRef<string | null>(null);

  // Define handlePlayNext before using it in effects
  const handlePlayNext = useCallback(async (isAutoplay = false) => {
    try {
      await api.post(API_ENDPOINTS.PLAY_NEXT_SONG(room._id));
      // Room will be updated via socket event
    } catch (error) {
      console.error("Failed to play next song:", error);
      const err = error as { response?: { data?: { message?: string } } };
      if (!isAutoplay) {
        alert(err.response?.data?.message || "Failed to start playing");
      }
    }
  }, [room._id]);

  // Reset songEndedHandled when song changes
  useEffect(() => {
    songEndedHandledRef.current = false;
  }, [currentSong?._id]);

  // Autoplay handler - when a song ends, play the next one
  useEffect(() => {
    if (!isHost) return;

    const handleSongEnded = async (event: Event) => {
      const customEvent = event as CustomEvent<{ roomId: string }>;
      if (
        customEvent.detail.roomId === room._id &&
        !songEndedHandledRef.current
      ) {
        songEndedHandledRef.current = true;
        console.log("🎵 Song ended, autoplaying next song...");

        try {
          await fetchQueue();
          await handlePlayNext(true);
        } catch (err) {
          console.error("Error in autoplay:", err);
          try {
            await handlePlayNext(true);
          } catch (retryErr) {
            console.error("Retry failed:", retryErr);
          }
        }
      }
    };

    window.addEventListener("youtube-song-ended", handleSongEnded);

    return () => {
      window.removeEventListener("youtube-song-ended", handleSongEnded);
    };
  }, [isHost, room._id, fetchQueue, handlePlayNext]);

  // Play song with YouTube when it changes or player becomes ready
  useEffect(() => {
    if (!isHost || !currentSong || !youtubePlayer.isReady) return;

    // Only trigger if the song actually changed (avoid re-playing on every re-render)
    if (currentSong.youtubeId && lastPlayedSongIdRef.current !== currentSong._id) {
      console.log("🎵 Playing with YouTube:", currentSong.youtubeId);
      lastPlayedSongIdRef.current = currentSong._id;
      setCurrentTime(0);
      setDuration(0);
      youtubePlayer.playVideo(currentSong.youtubeId, 0);
    }
  }, [currentSong?._id, currentSong?.youtubeId, isHost, youtubePlayer.isReady, youtubePlayer.playVideo]);

  // Sync YouTube player state - always update to stay in sync
  useEffect(() => {
    if (!isHost || !youtubePlayer.isReady) return;

    setIsPlaying(youtubePlayer.isPlaying);
    if (!isDraggingSlider && !isSeeking) {
      setCurrentTime(youtubePlayer.currentTime);
    }

    // Always update duration when it's valid
    if (youtubePlayer.duration > 0) {
      setDuration(youtubePlayer.duration);
    }

    // Broadcast to members when valid
    if (isHost && youtubePlayer.duration > 0) {
      socketService.emit("playback-update", {
        roomId: room._id,
        duration: youtubePlayer.duration,
        currentTime: youtubePlayer.currentTime,
        isPlaying: youtubePlayer.isPlaying,
      });
    }
  }, [
    youtubePlayer.isPlaying,
    youtubePlayer.currentTime,
    youtubePlayer.duration,
    isHost,
    room._id,
    isDraggingSlider,
  ]);

  // Listen for playback updates from host (ONLY for members)
  useEffect(() => {
    if (isHost) return; // Host doesn't need to listen

    const handlePlaybackUpdate = (data: {
      duration: number;
      currentTime: number;
      isPlaying: boolean;
    }) => {
      setDuration(data.duration);
      if (!isDraggingSlider && !isSeeking) {
        setCurrentTime(data.currentTime);
      }
      setIsPlaying(data.isPlaying);
    };

    socketService.on("playback-update", handlePlaybackUpdate);

    return () => {
      socketService.off("playback-update", handlePlaybackUpdate);
    };
  }, [isHost, isDraggingSlider]);

  const handlePlay = () => {
    if (isHost && youtubePlayer.isReady) {
      if (currentSong?.youtubeId) {
        if (
          !youtubePlayer.currentVideoId ||
          youtubePlayer.currentVideoId !== currentSong.youtubeId
        ) {
          console.log("Loading and playing video:", currentSong.youtubeId);
          youtubePlayer.playVideo(currentSong.youtubeId, 0);
        } else {
          console.log("Resuming current video");
          youtubePlayer.resume();
        }
      } else {
        youtubePlayer.resume();
      }
      setIsPlaying(true);
      socketService.emit("playback-update", {
        roomId: room._id,
        duration: youtubePlayer.duration,
        currentTime: youtubePlayer.currentTime,
        isPlaying: true,
      });
    }
  };

  const handlePause = () => {
    if (isHost && youtubePlayer.isReady) {
      youtubePlayer.pause();
      setIsPlaying(false);
      socketService.emit("playback-update", {
        roomId: room._id,
        duration: youtubePlayer.duration,
        currentTime: youtubePlayer.currentTime,
        isPlaying: false,
      });
    }
  };

  const handleSkip = async () => {
    if (currentSong && isHost) {
      if (youtubePlayer.isReady) {
        youtubePlayer.pause();
        setIsPlaying(false);
      }

      socketService.emit(SOCKET_EVENTS.HOST_SKIP, {
        roomId: room._id,
        songId: currentSong._id,
      });

      // Reset last played so the next song will trigger playback
      lastPlayedSongIdRef.current = null;

      if (queue.length > 0) {
        try {
          await fetchQueue();
          setTimeout(() => handlePlayNext(), 1000);
        } catch (err) {
          console.error("Error fetching queue after skip:", err);
          setTimeout(() => handlePlayNext(), 1000);
        }
      }
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
  };

  const handleSliderMouseDown = () => {
    setIsDraggingSlider(true);
    setIsSeeking(true);
  };

  const handleSliderMouseUp = () => {
    setIsDraggingSlider(false);

    if (isHost && youtubePlayer.isReady) {
      youtubePlayer.seek(currentTime);
      socketService.emit("playback-update", {
        roomId: room._id,
        duration: youtubePlayer.duration,
        currentTime: currentTime,
        isPlaying: youtubePlayer.isPlaying,
      });
      // Ignore player time updates for 1 second to allow seek to process and prevent snapping back
      setTimeout(() => setIsSeeking(false), 1000);
    } else {
      setIsSeeking(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // CRITICAL FIX: Always render the YouTube player div for the host,
  // even when no song is playing. This ensures the YT.Player can
  // initialize on the DOM element and be ready when a song starts.
  return (
    <div className="rounded-2xl border border-white/10 bg-surface/40 backdrop-blur-xl p-6">
      {/* YouTube Player Container - ALWAYS rendered for host (hidden when no song) */}
      {isHost && (
        <div className={currentSong ? "mb-4" : "hidden"}>
          <div
            id={`youtube-player-${room._id}`}
            className="w-full aspect-video rounded-lg overflow-hidden"
          ></div>
        </div>
      )}

      {!currentSong ? (
        /* No song playing state */
        <div className="text-center py-2">
          <div className="text-muted mb-2">No song playing</div>
          <div className="text-white/60 text-sm mb-4">
            Add a song to get started!
          </div>
          {isHost && queue.length > 0 && (
            <button
              onClick={handlePlayNext}
              className="px-6 py-2 rounded-lg bg-purple-500 text-white hover:bg-purple-600 transition"
            >
              ▶ Start Playing
            </button>
          )}
        </div>
      ) : (
        /* Now playing state */
        <>
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm text-muted">Now Playing</div>
            <div className="flex items-center gap-2">
              {isHost && youtubePlayer.isReady && (
                <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                  YouTube Music (Full Song)
                </div>
              )}
              {!isHost && (
                <div className="flex items-center gap-2 text-xs text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full">
                  <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></span>
                  Playing on host&apos;s device
                </div>
              )}
              {isHost && youtubePlayer.isReady && (
                <div className="flex items-center gap-2 text-xs text-green-400 bg-green-500/10 px-3 py-1 rounded-full">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  {isPlaying ? "Playing locally" : "Ready to play"}
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-6">
            {currentSong.thumbnail && (
              <img
                src={currentSong.thumbnail}
                alt={currentSong.title}
                className="w-24 h-24 rounded-lg object-cover"
              />
            )}
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-white mb-1">
                {currentSong.title}
              </h3>
              <p className="text-lg text-muted mb-4">{currentSong.artist}</p>

              {/* Audio Progress Bar with Slider */}
              <div className="mb-4">
                <input
                  type="range"
                  min="0"
                  max={duration || 1}
                  step="0.1"
                  value={Math.min(currentTime, duration || 0)}
                  onChange={handleSliderChange}
                  onMouseDown={handleSliderMouseDown}
                  onMouseUp={handleSliderMouseUp}
                  onTouchStart={handleSliderMouseDown}
                  onTouchEnd={handleSliderMouseUp}
                  disabled={!isHost}
                  className="w-full h-2 bg-gray-700 rounded-full appearance-none cursor-pointer slider mb-2"
                  style={{
                    background: `linear-gradient(to right, #a855f7 0%, #a855f7 ${
                      duration > 0 ? (currentTime / duration) * 100 : 0
                    }%, #374151 ${
                      duration > 0 ? (currentTime / duration) * 100 : 0
                    }%, #374151 100%)`,
                  }}
                />
                <div className="flex justify-between text-xs text-muted">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Playback Controls */}
              <div className="space-y-2">
                {!isHost && (
                  <div className="text-xs text-muted mb-2">
                    🎵 Only the host can control playback
                  </div>
                )}
                <div className="flex gap-3">
                  {isHost && (
                    <>
                      {isPlaying ? (
                        <button
                          onClick={handlePause}
                          className="px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition"
                        >
                          ⏸ Pause
                        </button>
                      ) : (
                        <button
                          onClick={handlePlay}
                          className="px-4 py-2 rounded-lg bg-purple-500 text-white hover:bg-purple-600 transition"
                        >
                          ▶ Play
                        </button>
                      )}
                      <button
                        onClick={handleSkip}
                        className="px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition"
                      >
                        ⏭ Skip
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Queue List Component
function QueueList({
  queue,
  roomId,
  room,
  currentUserId,
}: {
  queue: Song[];
  roomId: string;
  room: Room;
  currentUserId?: string;
}) {
  // Check if current user is host
  const isHost =
    room &&
    currentUserId &&
    (typeof room.host === "string"
      ? room.host === currentUserId
      : room.host._id === currentUserId);

  // Sort queue based on room mode
  const sortedQueue = [...queue].sort((a, b) => {
    if (room.mode === "democratic") {
      return b.voteScore - a.voteScore;
    }
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  const handleVote = async (songId: string, type: "upvote" | "downvote") => {
    try {
      const endpoint =
        type === "upvote"
          ? API_ENDPOINTS.UPVOTE_SONG(roomId, songId)
          : API_ENDPOINTS.DOWNVOTE_SONG(roomId, songId);
      await api.post(endpoint);
    } catch (err) {
      console.error("Error voting:", err);
    }
  };

  const handleRemove = async (songId: string) => {
    if (!confirm("Remove this song from the queue?")) return;

    try {
      await api.delete(API_ENDPOINTS.REMOVE_SONG(roomId, songId));
    } catch (err) {
      console.error("Error removing song:", err);
      alert(
        "Failed to remove song. " + (err as any).response?.data?.message ||
          "Unknown error"
      );
    }
  };

  if (sortedQueue.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-surface/40 backdrop-blur-xl p-12 text-center">
        <div className="text-muted">No songs in queue</div>
        <div className="text-white/60 text-sm mt-2">
          Be the first to add a song!
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sortedQueue.map((song, index) => {
        const hasUpvoted =
          currentUserId && song.upvotes.includes(currentUserId);
        const hasDownvoted =
          currentUserId && song.downvotes.includes(currentUserId);
        const isAddedByUser =
          currentUserId &&
          (typeof song.addedBy === "string"
            ? song.addedBy === currentUserId
            : song.addedBy._id === currentUserId);
        const canRemove = isHost || isAddedByUser;

        return (
          <div
            key={song._id}
            className="rounded-xl border border-white/10 bg-surface/40 backdrop-blur-xl p-4 hover:border-white/20 transition"
          >
            <div className="flex items-center gap-4">
              <div className="text-muted font-mono text-sm w-8">
                #{index + 1}
              </div>

              {song.thumbnail && (
                <img
                  src={song.thumbnail}
                  alt={song.title}
                  className="w-14 h-14 rounded-lg object-cover"
                />
              )}

              <div className="flex-1 min-w-0">
                <h4 className="text-white font-medium truncate">
                  {song.title}
                </h4>
                <p className="text-sm text-muted truncate">{song.artist}</p>
              </div>

              {room.mode === "democratic" && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleVote(song._id, "upvote")}
                    className={`p-2 rounded-lg transition ${
                      hasUpvoted
                        ? "bg-green-500/20 text-green-400"
                        : "bg-white/5 text-muted hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 15l7-7 7 7"
                      />
                    </svg>
                  </button>
                  <span className="text-white font-medium w-8 text-center">
                    {song.voteScore}
                  </span>
                  <button
                    onClick={() => handleVote(song._id, "downvote")}
                    className={`p-2 rounded-lg transition ${
                      hasDownvoted
                        ? "bg-red-500/20 text-red-400"
                        : "bg-white/5 text-muted hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                </div>
              )}

              {canRemove && (
                <button
                  onClick={() => handleRemove(song._id)}
                  className="p-2 rounded-lg bg-white/5 text-red-400 hover:bg-red-500/10 transition"
                  title={isHost ? "Remove song (Host)" : "Remove your song"}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Members List Component
function MembersList({
  members,
  hostId,
}: {
  members: Room["members"];
  hostId: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-surface/40 backdrop-blur-xl p-6">
      <h3 className="text-xl font-bold text-white mb-4">
        Members ({members.length})
      </h3>
      <div className="space-y-3">
        {members.map((member) => {
          const user = member.user as User;
          const isHost = user._id === hostId;

          return (
            <div key={user._id} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="text-white font-medium">{user.name}</div>
                {isHost && <div className="text-xs text-purple-400">Host</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Add Song Modal Component
function AddSongModal({
  roomId,
  onClose,
}: {
  roomId: string;
  onClose: () => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState("");
  const [selectedSongs, setSelectedSongs] = useState<Set<string>>(new Set());

  // Search YouTube
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setError("");

    try {
      const response = await api.get(API_ENDPOINTS.YOUTUBE_SEARCH, {
        params: { q: searchQuery, limit: 10 },
      });
      setSearchResults(response.data.data || []);
    } catch (err: any) {
      setError(handleApiError(err));
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Toggle song selection (max 3 songs)
  const toggleSongSelection = (youtubeId: string) => {
    const newSelection = new Set(selectedSongs);
    if (newSelection.has(youtubeId)) {
      newSelection.delete(youtubeId);
    } else {
      // Limit to 3 songs max
      if (newSelection.size >= 3) {
        setError("You can only select up to 3 songs at once");
        setTimeout(() => setError(""), 3000);
        return;
      }
      newSelection.add(youtubeId);
    }
    setSelectedSongs(newSelection);
  };

  // Add selected songs to queue
  const handleAddSelectedSongs = async () => {
    if (selectedSongs.size === 0) return;

    setIsAdding(true);
    setError("");

    try {
      const songsToAdd = searchResults.filter((track) =>
        selectedSongs.has(track.youtubeId)
      );

      // Add songs sequentially to avoid overwhelming the server
      for (const track of songsToAdd) {
        const songData = {
          youtubeId: track.youtubeId,
          title: track.title,
          artist: track.artist,
          thumbnail: track.thumbnail || "",
          durationMs: track.durationMs,
        };

        await api.post(API_ENDPOINTS.ADD_SONG(roomId), songData);
      }

      setSelectedSongs(new Set());
      onClose();
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setIsAdding(false);
    }
  };

  // Add single song to queue
  const handleAddSong = async (track: any) => {
    setIsAdding(true);
    setError("");

    try {
      const songData = {
        youtubeId: track.youtubeId,
        title: track.title,
        artist: track.artist,
        thumbnail: track.thumbnail || "",
        durationMs: track.durationMs,
      };

      await api.post(API_ENDPOINTS.ADD_SONG(roomId), songData);
      onClose();
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-surface/95 backdrop-blur-xl p-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Add Song to Queue</h2>
          <button
            onClick={onClose}
            className="text-muted hover:text-white transition"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 p-3">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Search Bar */}
        <div className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search for a song..."
              className="flex-1 px-4 py-3 rounded-lg bg-black/40 border border-white/10 text-white placeholder-muted focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              onClick={handleSearch}
              disabled={isSearching || !searchQuery.trim()}
              className="px-6 py-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold hover:from-purple-600 hover:to-pink-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSearching ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Searching...
                </span>
              ) : (
                "Search"
              )}
            </button>
          </div>
          <p className="text-xs text-muted mt-2">
            🎵 Search by song title, artist, or album on YouTube Music
          </p>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Search Results
                </h3>
                <p className="text-xs text-muted mt-1">
                  {selectedSongs.size === 0
                    ? "Select up to 3 songs to add at once"
                    : `${selectedSongs.size}/3 songs selected`}
                </p>
              </div>
              {selectedSongs.size > 0 && (
                <button
                  onClick={handleAddSelectedSongs}
                  disabled={isAdding}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold hover:from-purple-600 hover:to-pink-600 transition disabled:opacity-50"
                >
                  {isAdding
                    ? "Adding..."
                    : `Add ${selectedSongs.size} Song${
                        selectedSongs.size > 1 ? "s" : ""
                      }`}
                </button>
              )}
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {searchResults.map((track) => {
                const isSelected = selectedSongs.has(track.youtubeId);
                return (
                  <div
                    key={track.youtubeId}
                    className={`flex items-center gap-4 p-3 rounded-lg border transition group cursor-pointer ${
                      isSelected
                        ? "bg-purple-500/20 border-purple-500"
                        : "bg-black/40 border-white/10 hover:border-purple-500/50"
                    }`}
                    onClick={() => toggleSongSelection(track.youtubeId)}
                  >
                    {/* Checkbox */}
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition ${
                        isSelected
                          ? "bg-purple-500 border-purple-500"
                          : "border-white/30"
                      }`}
                    >
                      {isSelected && (
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>

                    {track.thumbnail && (
                      <img
                        src={track.thumbnail}
                        alt={track.title}
                        className="w-14 h-14 rounded-lg object-cover"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-white font-medium truncate">
                          {track.title}
                        </h4>
                      </div>
                      <p className="text-sm text-muted truncate">
                        {track.artist}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddSong(track);
                      }}
                      disabled={isAdding}
                      className="px-4 py-2 rounded-lg bg-purple-500 text-white text-sm font-medium hover:bg-purple-600 transition opacity-0 group-hover:opacity-100 disabled:opacity-50"
                    >
                      {isAdding ? "Adding..." : "Add"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isSearching && searchQuery && searchResults.length === 0 && (
          <div className="text-center py-8">
            <div className="text-muted">
              No results found. Try a different search.
            </div>
          </div>
        )}

        {/* Suggestions when no search */}
        {!searchQuery && searchResults.length === 0 && (
          <div className="space-y-4">
            <div className="rounded-lg bg-purple-500/10 border border-purple-500/20 p-4">
              <h3 className="text-white font-semibold mb-2">
                💡 Tip: Multi-Select Feature
              </h3>
              <p className="text-sm text-muted mb-3">
                Click on songs to select up to 3 at once, then click "Add X
                Songs" to add them all together! You can have up to 30 songs in
                your queue.
              </p>
              <div className="text-sm text-white/80">
                <p className="font-medium mb-1">Try searching for:</p>
                <ul className="list-disc list-inside space-y-1 text-muted">
                  <li>"Blinding Lights" by The Weeknd</li>
                  <li>"Shape of You" by Ed Sheeran</li>
                  <li>"Levitating" by Dua Lipa</li>
                  <li>"Bohemian Rhapsody" by Queen</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
