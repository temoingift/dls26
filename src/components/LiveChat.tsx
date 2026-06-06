import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, MessageSquare } from "lucide-react";

type ChatMsg = {
  id: string;
  match_id: string;
  user_id: string;
  username: string;
  avatar_url: string | null;
  body: string;
  created_at: string;
};

export function LiveChat({ matchId }: { matchId: string }) {
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    supabase
      .from("live_chat")
      .select("*")
      .eq("match_id", matchId)
      .order("created_at", { ascending: true })
      .limit(200)
      .then(({ data }) => {
        if (active && data) setMessages(data as ChatMsg[]);
      });
    const ch = supabase
      .channel(`chat-${matchId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "live_chat", filter: `match_id=eq.${matchId}` },
        (payload) => setMessages((m) => [...m, payload.new as ChatMsg]),
      )
      .subscribe();
    return () => {
      active = false;
      supabase.removeChannel(ch);
    };
  }, [matchId]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    const body = draft.trim();
    if (!body || !user || sending) return;
    setSending(true);
    const { error } = await supabase.from("live_chat").insert({
      match_id: matchId,
      user_id: user.id,
      username: profile?.username ?? "player",
      avatar_url: profile?.avatar_url ?? null,
      body,
    });
    setSending(false);
    if (!error) setDraft("");
  };

  return (
    <div className="surface-card flex h-[480px] flex-col rounded-xl">
      <div className="flex items-center gap-2 border-b border-border/50 px-4 py-3">
        <MessageSquare className="h-4 w-4 text-gold" />
        <span className="font-display text-sm font-bold uppercase tracking-wider">Live Chat</span>
        <span className="ml-auto text-xs text-muted-foreground">{messages.length} msgs</span>
      </div>
      <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
        {messages.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No messages yet. Say something!
          </p>
        )}
        {messages.map((m) => (
          <div key={m.id} className="flex items-start gap-2">
            <Avatar className="h-7 w-7 shrink-0">
              {m.avatar_url && <AvatarImage src={m.avatar_url} />}
              <AvatarFallback className="text-[10px]">
                {m.username.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-gold">@{m.username}</div>
              <div className="break-words text-sm text-foreground/90">{m.body}</div>
            </div>
          </div>
        ))}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        className="flex gap-2 border-t border-border/50 p-3"
      >
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Send a message"
          maxLength={500}
        />
        <Button type="submit" size="icon" disabled={!draft.trim() || sending}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}