import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Search, MessageSquare } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/messages")({
  component: MessagesPage,
});

type ThreadRow = {
  id: string;
  user_a: string;
  user_b: string;
  last_message_at: string;
};
type Msg = {
  id: string;
  thread_id: string;
  sender_id: string;
  content: string;
  created_at: string;
};
type ProfileLite = { id: string; full_name: string; username: string; avatar_url: string | null };

function MessagesPage() {
  const { user } = useAuth();
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [searchQ, setSearchQ] = useState("");
  const [searchResults, setSearchResults] = useState<ProfileLite[]>([]);
  const qc = useQueryClient();

  // load threads + other-user profiles
  const { data: threadsData } = useQuery({
    queryKey: ["dm-threads", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data: threads } = await supabase
        .from("dm_threads")
        .select("*")
        .or(`user_a.eq.${user!.id},user_b.eq.${user!.id}`)
        .order("last_message_at", { ascending: false });
      const list = (threads ?? []) as ThreadRow[];
      const otherIds = list.map((t) => (t.user_a === user!.id ? t.user_b : t.user_a));
      let profilesById = new Map<string, ProfileLite>();
      if (otherIds.length) {
        const { data: profs } = await supabase
          .from("profiles")
          .select("id, full_name, username, avatar_url")
          .in("id", otherIds);
        profilesById = new Map((profs ?? []).map((p) => [p.id, p as ProfileLite]));
      }
      return list.map((t) => ({
        ...t,
        other: profilesById.get(t.user_a === user!.id ? t.user_b : t.user_a),
      }));
    },
  });

  // realtime: any new dm message refreshes thread list + active messages
  useEffect(() => {
    if (!user) return;
    const ch = supabase
      .channel("dm-stream")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "dm_messages" },
        (p) => {
          const m = p.new as Msg;
          qc.invalidateQueries({ queryKey: ["dm-threads", user.id] });
          qc.invalidateQueries({ queryKey: ["dm-messages", m.thread_id] });
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [user, qc]);

  // user search
  useEffect(() => {
    let active = true;
    if (searchQ.trim().length < 2 || !user) {
      setSearchResults([]);
      return;
    }
    const t = setTimeout(async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, username, avatar_url")
        .or(`username.ilike.%${searchQ}%,full_name.ilike.%${searchQ}%`)
        .neq("id", user.id)
        .limit(8);
      if (active) setSearchResults((data ?? []) as ProfileLite[]);
    }, 250);
    return () => {
      active = false;
      clearTimeout(t);
    };
  }, [searchQ, user]);

  const startChat = async (other: ProfileLite) => {
    if (!user) return;
    const [a, b] = user.id < other.id ? [user.id, other.id] : [other.id, user.id];
    let { data: existing } = await supabase
      .from("dm_threads")
      .select("*")
      .eq("user_a", a)
      .eq("user_b", b)
      .maybeSingle();
    if (!existing) {
      const { data, error } = await supabase
        .from("dm_threads")
        .insert({ user_a: a, user_b: b })
        .select()
        .single();
      if (error) {
        toast.error("Could not start chat");
        return;
      }
      existing = data;
    }
    setSearchQ("");
    setSearchResults([]);
    qc.invalidateQueries({ queryKey: ["dm-threads", user.id] });
    setActiveThreadId(existing!.id);
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm uppercase tracking-widest text-gold">Locker Room</p>
        <h1 className="font-display text-4xl font-bold">Messages</h1>
      </div>
      <div className="surface-card grid min-h-[70vh] overflow-hidden rounded-xl md:grid-cols-[300px_1fr]">
        {/* Sidebar */}
        <aside className="flex flex-col border-r border-border/40">
          <div className="relative border-b border-border/40 p-3">
            <Search className="absolute left-6 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              placeholder="Find a player..."
              className="pl-9"
            />
            {searchResults.length > 0 && (
              <div className="absolute left-3 right-3 top-14 z-10 max-h-72 overflow-auto rounded-lg border border-border bg-popover shadow-xl">
                {searchResults.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => startChat(p)}
                    className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-muted"
                  >
                    <Avatar profile={p} />
                    <div>
                      <div className="text-sm font-semibold">{p.full_name}</div>
                      <div className="text-xs text-muted-foreground">@{p.username}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="flex-1 overflow-y-auto">
            {threadsData?.length === 0 && (
              <div className="p-6 text-center text-sm text-muted-foreground">
                Search a player to start chatting.
              </div>
            )}
            {threadsData?.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveThreadId(t.id)}
                className={`flex w-full items-center gap-3 border-b border-border/30 p-3 text-left transition-colors hover:bg-muted/50 ${
                  activeThreadId === t.id ? "bg-gold/10" : ""
                }`}
              >
                <Avatar profile={t.other} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold">
                    {t.other?.full_name ?? "Unknown"}
                  </div>
                  <div className="truncate text-xs text-muted-foreground">@{t.other?.username}</div>
                </div>
              </button>
            ))}
          </div>
        </aside>

        {/* Active conversation */}
        <section className="flex flex-col">
          {activeThreadId ? (
            <ChatPane
              key={activeThreadId}
              threadId={activeThreadId}
              currentUserId={user!.id}
              other={threadsData?.find((t) => t.id === activeThreadId)?.other}
            />
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center text-muted-foreground">
              <MessageSquare className="h-10 w-10 text-gold/50" />
              <p className="mt-3">Pick a conversation</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function Avatar({ profile }: { profile?: ProfileLite }) {
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-gold/30 bg-muted">
      {profile?.avatar_url ? (
        <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
      ) : (
        <span className="text-sm font-bold text-gold">
          {profile?.full_name?.[0]?.toUpperCase() ?? "?"}
        </span>
      )}
    </div>
  );
}

function ChatPane({
  threadId,
  currentUserId,
  other,
}: {
  threadId: string;
  currentUserId: string;
  other?: ProfileLite;
}) {
  const [text, setText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: messages } = useQuery({
    queryKey: ["dm-messages", threadId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dm_messages")
        .select("*")
        .eq("thread_id", threadId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as Msg[];
    },
  });

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    const content = text.trim();
    if (!content) return;
    setText("");
    const { error } = await supabase
      .from("dm_messages")
      .insert({ thread_id: threadId, sender_id: currentUserId, content });
    if (error) {
      toast.error("Could not send");
      setText(content);
      return;
    }
    await supabase
      .from("dm_threads")
      .update({ last_message_at: new Date().toISOString() })
      .eq("id", threadId);
  };

  return (
    <>
      <header className="flex items-center gap-3 border-b border-border/40 p-4">
        <Avatar profile={other} />
        <div>
          <div className="font-display text-lg font-bold">{other?.full_name ?? "Conversation"}</div>
          <div className="text-xs text-muted-foreground">@{other?.username}</div>
        </div>
      </header>
      <div ref={scrollRef} className="flex-1 space-y-2 overflow-y-auto p-4">
        {messages?.map((m) => {
          const mine = m.sender_id === currentUserId;
          return (
            <div
              key={m.id}
              className={`flex ${mine ? "justify-end" : "justify-start"} animate-fade-in`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                  mine
                    ? "rounded-br-sm bg-gold text-gold-foreground"
                    : "rounded-bl-sm bg-muted text-foreground"
                }`}
              >
                {m.content}
                <div className={`mt-1 text-[10px] ${mine ? "text-gold-foreground/70" : "text-muted-foreground"}`}>
                  {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            </div>
          );
        })}
        {messages?.length === 0 && (
          <div className="py-12 text-center text-sm text-muted-foreground">
            Say hello to start the conversation.
          </div>
        )}
      </div>
      <div className="border-t border-border/40 p-3">
        <div className="flex gap-2">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder="Type a message..."
          />
          <Button onClick={send} disabled={!text.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </>
  );
}