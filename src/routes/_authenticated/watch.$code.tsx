import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { ICE_SERVERS, sendSignal } from "@/lib/liveMatch";
import { Radio, ArrowLeft } from "lucide-react";
import { FootballLoader } from "@/components/FootballLoader";
import { LiveChat } from "@/components/LiveChat";

export const Route = createFileRoute("/_authenticated/watch/$code")({
  component: WatchMatch,
});

type Match = {
  id: string;
  host_id: string;
  join_code: string;
  home_player: string;
  away_player: string;
  home_score: number;
  away_score: number;
  status: "live" | "ended";
};

function WatchMatch() {
  const { code } = Route.useParams();
  const { user } = useAuth();
  const [match, setMatch] = useState<Match | null>(null);
  const [connState, setConnState] = useState<string>("connecting");
  const videoRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);

  // load match
  useEffect(() => {
    let active = true;
    supabase
      .from("live_matches")
      .select("*")
      .eq("join_code", code)
      .maybeSingle()
      .then(({ data }) => {
        if (active && data) setMatch(data as Match);
      });
    return () => {
      active = false;
    };
  }, [code]);

  // realtime score updates
  useEffect(() => {
    if (!match) return;
    const ch = supabase
      .channel(`match-${match.id}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "live_matches", filter: `id=eq.${match.id}` },
        (payload) => setMatch(payload.new as Match),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [match?.id]);

  // WebRTC viewer connection
  useEffect(() => {
    if (!match || !user || match.status !== "live") return;
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    pcRef.current = pc;

    // Make sure we have m-lines ready to receive audio and video.
    try {
      pc.addTransceiver("video", { direction: "recvonly" });
      pc.addTransceiver("audio", { direction: "recvonly" });
    } catch (e) {
      console.warn("addTransceiver not supported", e);
    }

    pc.ontrack = (e) => {
      console.log("[viewer] got track", e.track.kind);
      if (videoRef.current) {
        videoRef.current.srcObject = e.streams[0];
        videoRef.current.play().catch(() => {});
      }
    };
    pc.onicecandidate = (e) => {
      if (e.candidate) {
        sendSignal({
          match_id: match.id,
          from_user: user.id,
          to_user: match.host_id,
          kind: "ice",
          payload: e.candidate.toJSON(),
        });
      }
    };
    pc.onconnectionstatechange = () => {
      console.log("[viewer] connection", pc.connectionState);
      setConnState(pc.connectionState);
    };
    pc.oniceconnectionstatechange = () => {
      console.log("[viewer] ice", pc.iceConnectionState);
    };

    const channel = supabase
      .channel(`signaling-viewer-${match.id}-${user.id}`)
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
          if (row.from_user !== match.host_id) return;
          if (row.to_user !== user.id) return;

          if (row.kind === "offer") {
            await pc.setRemoteDescription(row.payload as RTCSessionDescriptionInit);
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            await sendSignal({
              match_id: match.id,
              from_user: user.id,
              to_user: match.host_id,
              kind: "answer",
              payload: answer,
            });
          } else if (row.kind === "ice") {
            await pc.addIceCandidate(row.payload as RTCIceCandidateInit).catch(() => {});
          }
        },
      )
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          // announce that we joined
          await sendSignal({
            match_id: match.id,
            from_user: user.id,
            to_user: match.host_id,
            kind: "join",
            payload: {},
          });
        }
      });

    return () => {
      pc.close();
      pcRef.current = null;
      supabase.removeChannel(channel);
    };
  }, [match?.id, match?.host_id, match?.status, user?.id]);

  if (!match) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <FootballLoader label="Finding the match..." />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Link to="/watch" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-gold">
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 text-xs uppercase tracking-widest text-gold">
            <Radio className="h-3 w-3 animate-pulse" />
            {match.status === "live" ? "Live" : "Ended"} · {connState}
          </p>
          <h1 className="font-display text-3xl font-bold">
            {match.home_player} <span className="text-muted-foreground">vs</span> {match.away_player}
          </h1>
        </div>
        <div className="surface-card rounded-xl px-6 py-3 bg-gradient-to-r from-gold/15 to-transparent border border-gold/30">
          <span className="font-display text-4xl font-bold text-gold drop-shadow-[0_0_20px_rgba(230,180,100,0.3)]">
            {match.home_score} - {match.away_score}
          </span>
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="surface-card rounded-3xl border border-gold/20 bg-gradient-to-br from-gold/8 to-transparent p-4 text-sm text-muted-foreground lg:col-span-3">
          {match.status === "live" ? (
            <p className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-gold animate-pulse"></span>
              Live preview is connecting. If the video does not appear, ask the host to refresh and share the game code again.
            </p>
          ) : (
            <p>This match has ended. Watch the archived replay in History if available.</p>
          )}
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="surface-card overflow-hidden rounded-xl lg:col-span-2">
          <video ref={videoRef} autoPlay playsInline controls className="w-full bg-black" />
        </div>
        <LiveChat matchId={match.id} />
      </div>
      {match.status === "ended" && (
        <div className="surface-card rounded-xl p-6 text-center">
          <p className="text-muted-foreground">This match has ended.</p>
          <p className="mt-2 font-display text-2xl font-bold text-gold">
            Final: {match.home_player} {match.home_score} - {match.away_score} {match.away_player}
          </p>
        </div>
      )}
    </div>
  );
}