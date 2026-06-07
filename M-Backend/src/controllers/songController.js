const Song = require("../models/Song");
const Room = require("../models/Room");
const { SONG_STATUS } = require("../config/constants");

// @desc    Add song to room queue
// @route   POST /api/rooms/:roomId/songs
// @access  Private (Members only)
exports.addSong = async (req, res, next) => {
  try {
    const { youtubeId, title, artist, thumbnail, durationMs } = req.body;
    const room = req.room;

    // Log the received data for debugging
    console.log("Adding song with data:", {
      youtubeId,
      title,
      artist,
      thumbnail,
      durationMs,
    });

    // Validate required fields
    if (!youtubeId || !title || !artist || durationMs === undefined) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: youtubeId, title, artist, and durationMs are required",
      });
    }

    // Check if duplicates are allowed
    if (!room.settings.allowDuplicates) {
      const existingSong = await Song.findOne({
        room: room._id,
        youtubeId,
        status: SONG_STATUS.QUEUED,
      });

      if (existingSong) {
        return res.status(400).json({
          success: false,
          message: "This song is already in the queue",
        });
      }
    }

    // Check max songs per user
    const userSongsCount = await Song.countDocuments({
      room: room._id,
      addedBy: req.user._id,
      status: SONG_STATUS.QUEUED,
    });

    if (userSongsCount >= room.settings.maxSongsPerUser) {
      return res.status(400).json({
        success: false,
        message: `You can only have ${room.settings.maxSongsPerUser} songs in the queue at a time`,
      });
    }

    // Check max queue size
    const queueSize = await Song.countDocuments({
      room: room._id,
      status: SONG_STATUS.QUEUED,
    });

    if (queueSize >= room.settings.maxQueueSize) {
      return res.status(400).json({
        success: false,
        message: "Queue is full",
      });
    }

    // Create song
    const song = await Song.create({
      youtubeId,
      title,
      artist,
      thumbnail,
      durationMs,
      addedBy: req.user._id,
      room: room._id,
    });

    const populatedSong = await Song.findById(song._id).populate(
      "addedBy",
      "name avatarUrl"
    );

    // Emit socket event to update queue in real-time
    const io = req.app.get("io");
    if (io) {
      io.to(req.room._id.toString()).emit("queue-updated", {
        action: "added",
        song: populatedSong,
      });
    }

    res.status(201).json({
      success: true,
      message: "Song added to queue",
      data: populatedSong,
    });
  } catch (error) {
    console.error("Error adding song:", error.message);

    // Handle mongoose validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }

    next(error);
  }
};

// @desc    Upvote a song
// @route   POST /api/rooms/:roomId/songs/:songId/upvote
// @access  Private (Members only)
exports.upvoteSong = async (req, res, next) => {
  try {
    const song = await Song.findById(req.params.songId);

    if (!song) {
      return res.status(404).json({
        success: false,
        message: "Song not found",
      });
    }

    if (song.status !== SONG_STATUS.QUEUED) {
      return res.status(400).json({
        success: false,
        message: "Can only vote on queued songs",
      });
    }

    const userId = req.user._id;
    const hasUpvoted = song.upvotes.includes(userId);
    const hasDownvoted = song.downvotes.includes(userId);

    if (hasUpvoted) {
      // Remove upvote
      song.upvotes = song.upvotes.filter(
        (id) => id.toString() !== userId.toString()
      );
    } else {
      // Add upvote and remove downvote if exists
      if (hasDownvoted) {
        song.downvotes = song.downvotes.filter(
          (id) => id.toString() !== userId.toString()
        );
      }
      song.upvotes.push(userId);
    }

    await song.save();

    const populatedSong = await Song.findById(song._id).populate(
      "addedBy",
      "name avatarUrl"
    );

    // Emit socket event to update song in real-time
    const io = req.app.get("io");
    if (io) {
      io.to(req.room._id.toString()).emit("song-updated", {
        song: populatedSong,
      });
    }

    res.status(200).json({
      success: true,
      data: populatedSong,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Downvote a song
// @route   POST /api/rooms/:roomId/songs/:songId/downvote
// @access  Private (Members only)
exports.downvoteSong = async (req, res, next) => {
  try {
    const song = await Song.findById(req.params.songId);

    if (!song) {
      return res.status(404).json({
        success: false,
        message: "Song not found",
      });
    }

    if (song.status !== SONG_STATUS.QUEUED) {
      return res.status(400).json({
        success: false,
        message: "Can only vote on queued songs",
      });
    }

    const userId = req.user._id;
    const hasUpvoted = song.upvotes.includes(userId);
    const hasDownvoted = song.downvotes.includes(userId);

    if (hasDownvoted) {
      // Remove downvote
      song.downvotes = song.downvotes.filter(
        (id) => id.toString() !== userId.toString()
      );
    } else {
      // Add downvote and remove upvote if exists
      if (hasUpvoted) {
        song.upvotes = song.upvotes.filter(
          (id) => id.toString() !== userId.toString()
        );
      }
      song.downvotes.push(userId);
    }

    await song.save();

    const populatedSong = await Song.findById(song._id).populate(
      "addedBy",
      "name avatarUrl"
    );

    // Emit socket event to update song in real-time
    const io = req.app.get("io");
    if (io) {
      io.to(req.room._id.toString()).emit("song-updated", {
        song: populatedSong,
      });
    }

    res.status(200).json({
      success: true,
      data: populatedSong,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Skip a song
// @route   POST /api/rooms/:roomId/songs/:songId/skip
// @access  Private (Host only)
exports.skipSong = async (req, res, next) => {
  try {
    const song = await Song.findById(req.params.songId);
    const room = req.room;

    if (!song) {
      return res.status(404).json({
        success: false,
        message: "Song not found",
      });
    }

    // Only host can skip songs
    const isHost = room.isHost(req.user._id);
    if (!isHost) {
      return res.status(403).json({
        success: false,
        message: "Only the host can skip songs",
      });
    }

    // Mark song as skipped
    song.status = SONG_STATUS.SKIPPED;
    song.playedAt = new Date();
    await song.save();

    // Clear current song if this was playing
    if (
      room.currentSong &&
      room.currentSong.toString() === song._id.toString()
    ) {
      room.currentSong = null;
      room.playbackState.isPlaying = false;
      await room.save();
    }

    res.status(200).json({
      success: true,
      message: "Song skipped",
      data: song,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove song from queue
// @route   DELETE /api/rooms/:roomId/songs/:songId
// @access  Private (Song owner or Host)
exports.removeSong = async (req, res, next) => {
  try {
    const song = await Song.findById(req.params.songId);
    const room = req.room;

    if (!song) {
      return res.status(404).json({
        success: false,
        message: "Song not found",
      });
    }

    // Check if user is song owner or host
    const isOwner = song.addedBy.toString() === req.user._id.toString();
    const isHost = room.isHost(req.user._id);

    if (!isOwner && !isHost) {
      return res.status(403).json({
        success: false,
        message:
          "You can only remove songs you added. Host can remove any song.",
      });
    }

    await song.deleteOne();

    // Emit socket event to update queue
    const io = req.app.get("io");
    if (io) {
      io.to(req.room._id.toString()).emit("queue-updated", {
        action: "removed",
        songId: song._id,
      });
    }

    res.status(200).json({
      success: true,
      message: "Song removed from queue",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Play next song in queue
// @route   POST /api/rooms/:roomId/songs/play-next
// @access  Private (Host only)
exports.playNextSong = async (req, res, next) => {
  try {
    const room = req.room;

    // Find next song based on room mode
    let nextSong;
    if (room.mode === "democratic") {
      // Get all queued songs and sort by vote score in memory
      const queuedSongs = await Song.find({
        room: room._id,
        status: SONG_STATUS.QUEUED,
      }).populate("addedBy", "name avatarUrl");

      if (queuedSongs.length > 0) {
        // Sort by vote score (upvotes - downvotes), then by creation time
        queuedSongs.sort((a, b) => {
          const scoreA = a.upvotes.length - a.downvotes.length;
          const scoreB = b.upvotes.length - b.downvotes.length;
          if (scoreB !== scoreA) return scoreB - scoreA;
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        });
        nextSong = queuedSongs[0];
      }
    } else {
      // Get oldest song (FIFO)
      nextSong = await Song.findOne({
        room: room._id,
        status: SONG_STATUS.QUEUED,
      })
        .sort({ createdAt: 1 })
        .populate("addedBy", "name avatarUrl");
    }

    if (!nextSong) {
      // Clear current song if queue is empty
      if (room.currentSong) {
        await Song.findByIdAndUpdate(room.currentSong, {
          status: SONG_STATUS.PLAYED,
          playedAt: new Date(),
        });
        await Room.findByIdAndUpdate(room._id, {
          $unset: { currentSong: "" },
          $set: {
            "playbackState.isPlaying": false,
            "playbackState.position": 0
          }
        });
        
        const populatedRoom = await Room.findById(room._id)
          .populate("host", "name email avatarUrl")
          .populate("members.user", "name email avatarUrl")
          .populate("currentSong");

        // Emit socket event
        const io = req.app.get("io");
        if (io) {
          io.to(room._id.toString()).emit("song-started", {
            room: populatedRoom,
          });
        }
      }

      return res.status(404).json({
        success: false,
        message: "No songs in queue",
      });
    }

    // Mark current song as played if exists
    if (room.currentSong) {
      await Song.findByIdAndUpdate(room.currentSong, {
        status: SONG_STATUS.PLAYED,
        playedAt: new Date(),
      });
    }

    // Set next song as current
    room.currentSong = nextSong._id;
    room.playbackState.isPlaying = true;
    room.playbackState.position = 0;
    await room.save();

    const populatedRoom = await Room.findById(room._id)
      .populate("host", "name email avatarUrl")
      .populate("members.user", "name email avatarUrl")
      .populate("currentSong");

    // Emit socket event
    const io = req.app.get("io");
    if (io) {
      io.to(room._id.toString()).emit("song-started", {
        room: populatedRoom,
      });
    }

    res.status(200).json({
      success: true,
      message: "Playing next song",
      data: populatedRoom,
    });
  } catch (error) {
    next(error);
  }
};
