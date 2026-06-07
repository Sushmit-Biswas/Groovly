"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export const useYouTubePlayer = (isHost: boolean, roomId: string) => {
  const [player, setPlayer] = useState<YT.Player | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const playerRef = useRef<YT.Player | null>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  const initAttemptRef = useRef<NodeJS.Timeout | null>(null);
  const isInitializedRef = useRef(false);

  // Progress tracking
  const startProgressTracking = useCallback(() => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }
    console.log("▶️ Starting progress tracking");
    progressInterval.current = setInterval(() => {
      if (playerRef.current) {
        try {
          const time = playerRef.current.getCurrentTime();
          const dur = playerRef.current.getDuration();
          setCurrentTime(time);
          if (dur && dur > 0) {
            setDuration(dur);
          }
        } catch (e) {
          console.error("Error getting playback time:", e);
        }
      }
    }, 1000);
  }, []);

  const stopProgressTracking = useCallback(() => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }
  }, []);

  // Initialize YouTube IFrame API - waits for DOM element to exist
  useEffect(() => {
    if (!isHost) {
      console.log("Skipping YouTube Player initialization: not host");
      return;
    }

    console.log("Initializing YouTube Player...");
    isInitializedRef.current = false;

    const containerId = `youtube-player-${roomId}`;

    const createPlayer = () => {
      // Don't re-initialize if already done
      if (isInitializedRef.current) return;

      const container = document.getElementById(containerId);
      if (!container) {
        console.log(`Waiting for DOM element #${containerId} to appear...`);
        // Retry until the DOM element exists
        initAttemptRef.current = setTimeout(createPlayer, 200);
        return;
      }

      // Check if YouTube API is loaded
      if (typeof YT === "undefined" || !YT.Player) {
        console.log("Waiting for YouTube IFrame API...");
        initAttemptRef.current = setTimeout(createPlayer, 200);
        return;
      }

      // If there's already an iframe in the container (e.g., from a previous init), skip
      if (container.querySelector("iframe")) {
        console.log("Player container already has an iframe, skipping init");
        return;
      }

      isInitializedRef.current = true;
      console.log(`✅ Creating YT.Player on #${containerId}`);

      try {
        const ytPlayer = new YT.Player(containerId, {
          height: "360",
          width: "640",
          playerVars: {
            autoplay: 1,
            controls: 1,
            disablekb: 0,
            fs: 1,
            modestbranding: 1,
            playsinline: 1,
            origin: window.location.origin,
          },
          events: {
            onReady: (event) => {
              console.log("✅ YouTube Player Ready!");
              playerRef.current = event.target;
              setPlayer(event.target);
              setIsReady(true);
            },
            onStateChange: (event) => {
              const states = [
                "UNSTARTED",
                "ENDED",
                "PLAYING",
                "PAUSED",
                "BUFFERING",
                "CUED",
              ];
              console.log(
                "YouTube Player State Changed:",
                event.data,
                `(${states[event.data + 1] || "UNKNOWN"})`
              );

              if (event.data === YT.PlayerState.PLAYING) {
                console.log("▶️ Video is PLAYING");
                setIsPlaying(true);
                // Get duration from the player object, with retry logic
                const getDurationWithRetry = () => {
                  const videoDuration =
                    playerRef.current?.getDuration() || 0;
                  if (videoDuration > 0) {
                    setDuration(videoDuration);
                  } else {
                    setTimeout(() => {
                      const retryDuration =
                        playerRef.current?.getDuration() || 0;
                      if (retryDuration > 0) {
                        setDuration(retryDuration);
                      }
                    }, 500);
                  }
                };
                getDurationWithRetry();
                startProgressTracking();
              } else if (event.data === YT.PlayerState.PAUSED) {
                console.log("⏸️ Video is PAUSED");
                setIsPlaying(false);
                stopProgressTracking();
              } else if (event.data === YT.PlayerState.ENDED) {
                console.log("⏹️ Video ENDED - Triggering autoplay");
                setIsPlaying(false);
                setCurrentTime(0);
                setDuration(0);
                stopProgressTracking();
                console.log("📢 Dispatching youtube-song-ended event");
                const autoplayEvent = new CustomEvent("youtube-song-ended", {
                  detail: { roomId },
                });
                window.dispatchEvent(autoplayEvent);
              } else if (event.data === YT.PlayerState.BUFFERING) {
                console.log("⏳ Video is BUFFERING");
              } else if (event.data === YT.PlayerState.CUED) {
                console.log("📝 Video is CUED (ready to play)");
              }
            },
            onError: (event) => {
              console.error("YouTube Player Error:", event.data);
            },
          },
        });
      } catch (err) {
        console.error("Failed to create YT.Player:", err);
        isInitializedRef.current = false;
        // Retry after a delay
        initAttemptRef.current = setTimeout(createPlayer, 1000);
      }
    };

    // Check if API is loaded
    if (window.YT && window.YT.Player) {
      createPlayer();
    } else {
      // Store the original callback if it exists
      const existingCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (existingCallback) existingCallback();
        createPlayer();
      };
      // Also poll in case onYouTubeIframeAPIReady already fired
      initAttemptRef.current = setTimeout(createPlayer, 500);
    }

    return () => {
      stopProgressTracking();
      if (initAttemptRef.current) {
        clearTimeout(initAttemptRef.current);
        initAttemptRef.current = null;
      }
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (e) {
          console.error("Error destroying player:", e);
        }
        playerRef.current = null;
      }
      setPlayer(null);
      setIsReady(false);
      isInitializedRef.current = false;
    };
  }, [isHost, roomId, startProgressTracking, stopProgressTracking]);

  // Play a video
  const playVideo = useCallback(
    async (videoId: string, startSeconds: number = 0) => {
      if (!playerRef.current) {
        console.error("❌ Player not ready (playerRef is null)");
        return;
      }

      try {
        console.log(
          "🎵 Loading video:",
          videoId,
          "starting at",
          startSeconds,
          "seconds"
        );
        setCurrentVideoId(videoId);
        setCurrentTime(0);
        setDuration(0);

        // Load the video
        if (startSeconds > 0) {
          playerRef.current.loadVideoById(videoId, startSeconds);
        } else {
          playerRef.current.loadVideoById(videoId);
        }

        console.log("✅ Video load command sent");

        // Force play after a brief delay to be sure
        setTimeout(() => {
          if (playerRef.current && playerRef.current.playVideo) {
            console.log("🎬 Forcing playVideo()...");
            playerRef.current.playVideo();
          }
        }, 500);
      } catch (error) {
        console.error("❌ Error playing video:", error);
      }
    },
    []
  );

  // Pause
  const pause = useCallback(async () => {
    if (!playerRef.current) return;

    try {
      playerRef.current.pauseVideo();
      console.log("✅ Paused");
    } catch (error) {
      console.error("Error pausing:", error);
    }
  }, []);

  // Resume
  const resume = useCallback(async () => {
    if (!playerRef.current) return;

    try {
      playerRef.current.playVideo();
      console.log("✅ Resumed");
    } catch (error) {
      console.error("Error resuming:", error);
    }
  }, []);

  // Seek
  const seek = useCallback(async (seconds: number) => {
    if (!playerRef.current) return;

    try {
      playerRef.current.seekTo(seconds, true);
      console.log("✅ Seeked to", seconds);
    } catch (error) {
      console.error("Error seeking:", error);
    }
  }, []);

  return {
    player,
    isReady,
    isPlaying,
    currentVideoId,
    duration,
    currentTime,
    playVideo,
    pause,
    resume,
    seek,
  };
};
