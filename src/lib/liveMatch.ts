import { supabase } from "@/integrations/supabase/client";

export const ICE_SERVERS: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
  { urls: "stun:stun.cloudflare.com:3478" },
  // Free public TURN relays — required when viewers are on mobile data or
  // behind symmetric NAT, otherwise the WebRTC stream never reaches them.
  // freestun.net is a long-running free public TURN server.
  {
    urls: ["turn:freestun.net:3478", "turn:freestun.net:3479"],
    username: "free",
    credential: "free",
  },
  {
    urls: ["turns:freestun.net:5350"],
    username: "free",
    credential: "free",
  },
];

export function generateJoinCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 6; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export async function sendSignal(args: {
  match_id: string;
  from_user: string;
  to_user: string | null;
  kind: "offer" | "answer" | "ice" | "join";
  payload: unknown;
}) {
  const { error } = await supabase.from("live_signaling").insert({
    match_id: args.match_id,
    from_user: args.from_user,
    to_user: args.to_user,
    kind: args.kind,
    payload: args.payload as never,
  });
  if (error) console.error("signal send error", error);
}