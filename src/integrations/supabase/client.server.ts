// Server-side stub for Supabase admin client.
// For local runs without Supabase, export a minimal admin-like API that mirrors
// the client stub. Server admin operations will be no-ops or return empty data.

type AnyObj = { [k: string]: any };

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

const auth = {
  getUser: async () => ({ data: null }),
  getUserById: async (_id: string) => ({ data: null }),
};

const storage = {
  from: (_bucket: string) => ({
    upload: async (_path: string, _file: any, _opts: any) => ({ error: null }),
    getPublicUrl: (_path: string) => ({ data: { publicUrl: `/assets/${_path}` } }),
  }),
};

export const supabaseAdmin: any = {
  from: (_table: string) => makeQuery(),
  auth,
  storage,
};
