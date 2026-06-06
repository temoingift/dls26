import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Radio, Square, Plus, Minus, Copy, Trophy, Camera, Monitor, Pause, Play, Volume2, Settings } from "lucide-react";
import { ICE_SERVERS, generateJoinCode, sendSignal } from "@/lib/liveMatch";
import { LiveChat } from "@/components/LiveChat";

export const Route = createFileRoute("/_authenticated/play")({
  component: PlayPage,
});

type Match = {
  id: string;
  join_code: string;
  home_player: string;
  away_player: string;
  home_score: number;
  away_score: number;
  status: "live" | "ended";
};

function PlayPage() {
  const { user, profile } = useAuth();
  const [homeName, setHomeName] = useState("");
  const [awayName, setAwayName] = useState("");
  const [match, setMatch] = useState<Match | null>(null);
  const [viewerCount, setViewerCount] = useState(0);
  const [source, setSource] = useState<"screen" | "camera">("screen");
  const [isMobile, setIsMobile] = useState(false);
  const [recordingState, setRecordingState] = useState<"pending" | "recording" | "uploading" | "saved" | "unsupported">("pending");
  const [sessionMessage, setSessionMessage] = useState("Choose screen or camera and start streaming.");
  const [videoPaused, setVideoPaused] = useState(false);
  const [videoQuality, setVideoQuality] = useState<"high" | "medium" | "low">("high");
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const peersRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (profile && !homeName) setHomeName(profile.full_name);
  }, [profile, homeName]);

  useEffect(() => {
    const userAgent = typeof navigator !== "undefined" ? navigator.userAgent : "";
    const mobile = /Mobi|Android|iPhone|iPad|iPod/i.test(userAgent);
    setIsMobile(mobile);
    if (mobile && source === "screen") setSource("camera");
  }, []);

  const cleanup = () => {
    peersRef.current.forEach((p) => p.close());
    peersRef.current.clear();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  };

  useEffect(() => () => cleanup(), []);

  // Handle pause/resume of stream
  useEffect(() => {
    if (!match || !streamRef.current) return;
    streamRef.current.getTracks().forEach((track) => {
      track.enabled = !videoPaused;
    });
  }, [videoPaused, match]);

  const startMatch = async () => {
    if (!user) return;
    if (!homeName.trim() || !awayName.trim()) {
      toast.error("Enter both player names");
      return;
    }
    // Pick the right capture API for the platform.
    let effectiveSource = source;
    if (
      effectiveSource === "screen" &&
      (typeof navigator.mediaDevices?.getDisplayMedia !== "function")
    ) {
      toast.info("Screen share isn't available on this device — using camera instead.");
      effectiveSource = "camera";
      setSource("camera");
    }
    let stream: MediaStream;
    try {
      if (effectiveSource === "screen") {
        stream = await navigator.mediaDevices.getDisplayMedia({
          video: { frameRate: 30 },
          audio: true,
        });
      } else {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: true,
        });
      }
    } catch (err) {
      console.error("getMedia failed", err);
      const msg = err instanceof Error ? err.message : "Permission denied";
      toast.error(
        effectiveSource === "screen"
          ? `Screen sharing failed: ${msg}`
          : `Camera access failed: ${msg}`,
      );
      setSessionMessage(
        effectiveSource === "screen"
          ? "Screen share failed. Try camera mode or use a supported desktop browser."
          : "Camera access failed. Allow camera permissions or try another device.",
      );
      return;
    }
    streamRef.current = stream;
    if (videoRef.current) videoRef.current.srcObject = stream;

    const code = generateJoinCode();
    const { data, error } = await supabase
      .from("live_matches")
      .insert({
        host_id: user.id,
        join_code: code,
        home_player: homeName.trim(),
        away_player: awayName.trim(),
      })
      .select()
      .single();
    if (error || !data) {
      toast.error("Could not start match");
      stream.getTracks().forEach((t) => t.stop());
      return;
    }
    setMatch(data as Match);
    toast.success(`Match live! Code: ${code}`);
    setRecordingState("pending");
    setSessionMessage("Live broadcast started. Viewers can join with the code above.");

    // Start recording the broadcast locally
    try {
      const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")
        ? "video/webm;codecs=vp9,opus"
        : MediaRecorder.isTypeSupported("video/webm;codecs=vp8,opus")
          ? "video/webm;codecs=vp8,opus"
          : "video/webm";
      chunksRef.current = [];
      const rec = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 1_500_000 });
      rec.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      rec.onstart = () => {
        setRecordingState("recording");
        setSessionMessage("Recording in progress — the replay will be uploaded when you end the match.");
      };
      rec.onerror = (event) => {
        console.warn("Recording error", event);
        setRecordingState("unsupported");
        setSessionMessage("Recording is not available in this browser. Your match can still broadcast live.");
      };
      rec.start(2000);
      recorderRef.current = rec;
    } catch (e) {
      console.warn("Recording not supported", e);
      setRecordingState("unsupported");
      setSessionMessage("Recording is not supported on this device. Live streaming still works.");
    }

    // when broadcaster stops sharing
    stream.getVideoTracks()[0].onended = () => endMatch(data.id);
  };

  // signaling listener: handle viewers joining
  useEffect(() => {
    if (!match || !user) return;
    const channel = supabase
      .channel(`signaling-host-${match.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "live_signaling",
          filter: `match_id=eq.${match.id}`,
        },
        async (payload) => {
          const row = payload.new as {
            kind: string;
            from_user: string;
            to_user: string | null;
            payload: unknown;
          };
          if (row.from_user === user.id) return;
          if (row.to_user && row.to_user !== user.id) return;

          if (row.kind === "join") {
            const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
            peersRef.current.set(row.from_user, pc);
            setViewerCount(peersRef.current.size);
            streamRef.current?.getTracks().forEach((t) =>
              pc.addTrack(t, streamRef.current!),
            );
            pc.onicecandidate = (e) => {
              if (e.candidate) {
                sendSignal({
                  match_id: match.id,
                  from_user: user.id,
                  to_user: row.from_user,
                  kind: "ice",
                  payload: e.candidate.toJSON(),
                });
              }
            };
            pc.onconnectionstatechange = () => {
              console.log("[host] peer", row.from_user, pc.connectionState);
              if (["disconnected", "failed", "closed"].includes(pc.connectionState)) {
                pc.close();
                peersRef.current.delete(row.from_user);
                setViewerCount(peersRef.current.size);
              }
            };
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            await sendSignal({
              match_id: match.id,
              from_user: user.id,
              to_user: row.from_user,
              kind: "offer",
              payload: offer,
            });
          } else if (row.kind === "answer") {
            const pc = peersRef.current.get(row.from_user);
            if (pc) {
              try {
                await pc.setRemoteDescription(row.payload as RTCSessionDescriptionInit);
              } catch (e) {
                console.error("[host] setRemoteDescription failed", e);
              }
            }
          } else if (row.kind === "ice") {
            const pc = peersRef.current.get(row.from_user);
            if (pc) await pc.addIceCandidate(row.payload as RTCIceCandidateInit).catch(() => {});
          }
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [match, user]);

  const bumpScore = async (side: "home" | "away", delta: number) => {
    if (!match) return;
    const next =
      side === "home"
        ? { home_score: Math.max(0, match.home_score + delta) }
        : { away_score: Math.max(0, match.away_score + delta) };
    const { data, error } = await supabase
      .from("live_matches")
      .update(next)
      .eq("id", match.id)
      .select()
      .single();
    if (!error && data) setMatch(data as Match);
  };

  const endMatch = async (matchId?: string) => {
    const id = matchId ?? match?.id;
    if (!id || !user) return;

    // Stop the recorder and wait for the final chunk
    const rec = recorderRef.current;
    const recordedBlob = await new Promise<Blob | null>((resolve) => {
      if (!rec || rec.state === "inactive") return resolve(null);
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: rec.mimeType || "video/webm" });
        chunksRef.current = [];
        resolve(blob);
      };
      try {
        rec.stop();
      } catch {
        resolve(null);
      }
    });
    recorderRef.current = null;

    await supabase
      .from("live_matches")
      .update({ status: "ended", ended_at: new Date().toISOString() })
      .eq("id", id);

    if (recordedBlob && recordedBlob.size > 0) {
      setUploading(true);
      setRecordingState("uploading");
      setSessionMessage("Uploading the saved replay to your match archive.");
      toast.info("Uploading match recording...");
      const path = `${user.id}/${id}.webm`;
      const { error: upErr } = await supabase.storage
        .from("match-recordings")
        .upload(path, recordedBlob, { contentType: "video/webm", upsert: true });
      if (upErr) {
        toast.error("Recording upload failed");
        setSessionMessage("Upload failed. The replay could not be saved.");
      } else {
        await supabase.from("live_matches").update({ recording_url: path }).eq("id", id);
        toast.success("Replay saved to Match History");
        setRecordingState("saved");
        setSessionMessage("Replay uploaded — it is now available in History.");
      }
      setUploading(false);
    } else {
      toast.success("Match ended. Final score recorded.");
      if (recordingState !== "unsupported") {
        setSessionMessage("Match ended. No recording was captured in this browser.");
      }
    }

    cleanup();
    setMatch(null);
    setViewerCount(0);
  };

  if (!match) {
    return (
      <div className="mx-auto max-w-xl space-y-6">
        <div>
          <p className="text-sm uppercase tracking-widest text-gold">Go Live</p>
          <h1 className="font-display text-4xl font-bold">Start a Live Game</h1>
          <p className="mt-2 text-muted-foreground">
            Broadcast your screen or camera so players can join live, and save the match replay automatically.
          </p>
        </div>
        <div className="surface-card space-y-4 rounded-xl p-6">
          <div className="space-y-2">
            <Label>Stream source</Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSource("screen")}
                disabled={isMobile}
                className={`flex items-center justify-center gap-2 rounded-lg border p-3 text-sm transition-colors ${
                  source === "screen"
                    ? "border-gold bg-gold/10 text-gold"
                    : "border-border text-muted-foreground hover:text-foreground"
                } ${isMobile ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <Monitor className="h-4 w-4" /> Screen share
              </button>
              <button
                type="button"
                onClick={() => setSource("camera")}
                className={`flex items-center justify-center gap-2 rounded-lg border p-3 text-sm transition-colors ${
                  source === "camera"
                    ? "border-gold bg-gold/10 text-gold"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                <Camera className="h-4 w-4" /> Phone camera
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              {isMobile
                ? "Mobile mode is active: use camera sharing for the best phone broadcast experience."
                : source === "screen"
                  ? "Best on desktop. Mirror your phone (scrcpy / AirPlay / Phone Link) then share that window."
                  : "Use camera mode to stream directly from your phone or tablet."}
            </p>
            <p className="text-xs text-muted-foreground">
              The broadcast is recorded locally and uploaded automatically when you end the match.
            </p>
          </div>
          <div className="space-y-2">
            <Label>Home player</Label>
            <Input value={homeName} onChange={(e) => setHomeName(e.target.value)} placeholder="You" />
          </div>
          <div className="space-y-2">
            <Label>Away player</Label>
            <Input value={awayName} onChange={(e) => setAwayName(e.target.value)} placeholder="Opponent" />
          </div>
          <Button onClick={startMatch} className="w-full gold-glow" size="lg">
            <Radio className="mr-2 h-4 w-4" />
            {isMobile ? "Start Mobile Broadcast" : source === "screen" ? "Start Match & Share Screen" : "Start Match & Use Camera"}
          </Button>
          <p className="text-xs text-muted-foreground">
            Your browser will ask for permission. Viewers can join with the code shown after you go live, and the replay is saved automatically.
          </p>
          <div className="rounded-3xl border border-neon/20 bg-[#071025] p-4 text-sm text-muted-foreground">
            <div className="font-semibold text-gold">Live broadcast tip</div>
            <p>{sessionMessage}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="flex items-center gap-2 text-sm uppercase tracking-widest text-gold">
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-gold" />
            Live broadcast
          </p>
          <h1 className="font-display text-2xl font-bold md:text-3xl">Match in progress</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="surface-card flex items-center gap-2 rounded-lg px-3 py-2">
            <span className="text-xs uppercase text-muted-foreground">Code</span>
            <span className="font-display text-xl font-bold tracking-widest text-gold">
              {match.join_code}
            </span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(match.join_code);
                toast.success("Code copied");
              }}
              className="text-muted-foreground hover:text-gold"
            >
              <Copy className="h-4 w-4" />
            </button>
          </div>
          <span className="text-xs text-gold bg-gold/10 rounded-full px-3 py-1.5">{viewerCount} watching</span>
          <Button size="sm" variant="outline" onClick={() => endMatch()} disabled={uploading} className="text-destructive hover:text-destructive">
            <Square className="mr-1 h-3 w-3" />
            {uploading ? "Saving..." : "End"}
          </Button>
        </div>
      </div>

      {/* Video Player - Full Width */}
      <div className="space-y-3">
        <div className="relative bg-black rounded-2xl overflow-hidden border border-gold/20 shadow-2xl">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full aspect-video bg-black object-cover"
          />
          {/* Video Overlay Controls */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity flex flex-col justify-between p-4">
            <div className="text-sm text-white/80">
              {recordingState === "recording" && "🔴 Recording live"}
              {recordingState === "uploading" && "⬆️ Saving replay"}
              {recordingState === "saved" && "✅ Replay saved"}
              {recordingState === "unsupported" && "⚠️ Recording unavailable"}
              {recordingState === "pending" && "Preparing stream..."}
            </div>
            <div className="flex gap-2 justify-center">
              <Button
                size="sm"
                variant="outline"
                className="bg-black/50 border-gold/40 hover:bg-gold/20"
                onClick={() => setVideoPaused(!videoPaused)}
              >
                {videoPaused ? (
                  <>
                    <Play className="h-4 w-4 mr-1" /> Resume
                  </>
                ) : (
                  <>
                    <Pause className="h-4 w-4 mr-1" /> Pause
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
        
        {/* Video Controls Bar */}
        <div className="surface-card rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-[#0a131f] to-[#0f1829]">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1 text-xs">
              <Settings className="h-4 w-4 text-gold" />
              <span className="text-muted-foreground">Quality:</span>
            </div>
            <div className="flex gap-1.5">
              {["high", "medium", "low"].map((q) => (
                <button
                  key={q}
                  onClick={() => setVideoQuality(q as "high" | "medium" | "low")}
                  className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                    videoQuality === q
                      ? "bg-gold text-black"
                      : "bg-gold/10 text-gold hover:bg-gold/20"
                  }`}
                >
                  {q === "high" ? "HD" : q === "medium" ? "SD" : "Low"}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm">
              <Volume2 className="h-4 w-4 text-gold" />
              <span className="text-muted-foreground">
                {videoPaused ? "Paused" : "Live"}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gold">
              <span className="inline-block h-2 w-2 rounded-full bg-gold animate-pulse" />
              {recordingState === "recording" ? "Recording" : "Streaming"}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {/* Scoreboards */}
          <div className="grid gap-3 grid-cols-2">
            <Scoreboard
              name={match.home_player}
              score={match.home_score}
              onPlus={() => bumpScore("home", 1)}
              onMinus={() => bumpScore("home", -1)}
            />
            <Scoreboard
              name={match.away_player}
              score={match.away_score}
              onPlus={() => bumpScore("away", 1)}
              onMinus={() => bumpScore("away", -1)}
            />
          </div>
          {/* Broadcast Status */}
          <div className="surface-card rounded-xl p-4 border border-gold/10 bg-gradient-to-br from-gold/5 to-transparent">
            <div className="text-sm">
              <div className="font-semibold text-gold mb-2">Broadcast Status</div>
              <p className="text-muted-foreground text-xs leading-relaxed">{sessionMessage}</p>
            </div>
          </div>
        </div>
        <LiveChat matchId={match.id} />
      </div>
    </div>
  );
}

function Scoreboard({
  name,
  score,
  onPlus,
  onMinus,
}: {
  name: string;
  score: number;
  onPlus: () => void;
  onMinus: () => void;
}) {
  return (
    <div className="surface-card flex items-center justify-between rounded-xl p-5 bg-gradient-to-br from-gold/8 to-transparent border border-gold/15 hover:border-gold/30 transition-all">
      <div className="min-w-0">
        <div className="text-xs uppercase tracking-wider text-gold/70">Player</div>
        <div className="mt-1 flex items-center gap-2 font-display text-lg font-bold truncate">
          <Trophy className="h-5 w-5 text-gold flex-shrink-0" />
          <span className="truncate">{name}</span>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <Button size="sm" variant="outline" onClick={onMinus} className="h-8 w-8 p-0 hover:bg-gold/20">
          <Minus className="h-3 w-3" />
        </Button>
        <span className="w-14 text-center font-display text-4xl font-bold text-gold">{score}</span>
        <Button size="sm" variant="outline" onClick={onPlus} className="h-8 w-8 p-0 hover:bg-gold/20">
          <Plus className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}