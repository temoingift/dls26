// Lightweight Supabase stub to allow the app to run without an external Supabase
// This intentionally avoids importing @supabase/supabase-js so the project can
// run without that dependency. The stub provides the minimal API surface used
// in the app (query chaining, auth methods, storage, realtime channels).

type AnyObj = { [k: string]: any };

const listeners = new Set<(event: string, session: AnyObj | null) => void>();

const auth = {
  _session: null as AnyObj | null,
  getSession: async () => ({ data: { session: auth._session } }),
  onAuthStateChange: (cb: (event: string, session: AnyObj | null) => void) => {
    listeners.add(cb);
    return { data: { subscription: { unsubscribe: () => listeners.delete(cb) } } };
  },
  signInWithPassword: async ({ email }: { email?: string }) => {
    const user = { id: `local:${email ?? 'anon'}`, email };
    auth._session = { user };
    listeners.forEach((cb) => cb('SIGNED_IN', auth._session));
    return { data: { session: auth._session }, error: null };
  },
  signUp: async ({ email, password, options }: any) => {
    const user = { id: `local:${email ?? Math.random().toString(36).slice(2)}`, email, ...options?.data };
    // do not auto-create a session (mimic email-confirm flows)
    return { data: { user, session: null }, error: null };
  },
  signOut: async () => {
    auth._session = null;
    listeners.forEach((cb) => cb('SIGNED_OUT', null));
    return { error: null };
  },
};

function makeQuery() {
  const q: AnyObj = {} as AnyObj;
  q.select = (..._args: any[]) => q;
  q.eq = (_col: string, _val: any) => q;
  q.in = (_col: string, _vals: any[]) => q;
  q.or = (_expr: string) => q;
  q.neq = (_col: string, _val: any) => q;
  q.order = (_col: string, _opts: any) => q;
  q.limit = (_n: number) => q;
  q.maybeSingle = async () => ({ data: null, error: null });
  q.single = async () => ({ data: null, error: null });
  q.insert = async (data: any) => ({ data, error: null });
  q.update = async (data: any) => ({ data, error: null });
  q.delete = async () => ({ data: null, error: null });
  q.then = (cb: any) => Promise.resolve(cb({ data: [] }));
  return q;
}

const storage = {
  from: (_bucket: string) => ({
    upload: async (_path: string, _file: any, _opts: any) => ({ error: null }),
    getPublicUrl: (_path: string) => ({ data: { publicUrl: `/assets/${_path}` } }),
  }),
};

const channels = new Map<string, any>();

function channel(name: string) {
  const ch: AnyObj = {
    name,
    on: (_evt: string, _opts: any, cb?: any) => ({
      subscribe: async () => {
        const sub = { name, cb };
        channels.set(name, sub);
        return sub;
      },
    }),
    subscribe: async () => {
      const sub = { name };
      channels.set(name, sub);
      return sub;
    },
  };
  return ch;
}

async function removeChannel(ch: any) {
  if (!ch) return;
  const n = ch.name ?? ch;
  channels.delete(n);
}

export const supabase: any = {
  auth,
  from: (_table: string) => makeQuery(),
  storage,
  channel,
  removeChannel,
};

