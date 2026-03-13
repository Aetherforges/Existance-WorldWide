import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function createStubClient() {
  const result = {
    data: null,
    error: { message: "Supabase is not configured." },
  };

  const chain = {
    select: () => chain,
    order: () => chain,
    eq: () => chain,
    insert: () => chain,
    update: () => chain,
    delete: () => chain,
    maybeSingle: async () => result,
    single: async () => result,
    then: (resolve) => Promise.resolve(resolve(result)),
  };

  return {
    auth: {
      signInWithPassword: async () => result,
      signUp: async () => result,
      verifyOtp: async () => result,
      getSession: async () => ({ data: { session: null } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
    },
    from: () => chain,
    storage: {
      from: () => ({
        upload: async () => result,
        getPublicUrl: () => ({ data: { publicUrl: "" } }),
      }),
    },
  };
}

export const supabase =
  supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey)
    : createStubClient();
