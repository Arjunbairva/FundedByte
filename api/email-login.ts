import { createClient } from "@supabase/supabase-js";

const PHONE_EMAIL_HOST = "user.phone.email";
const SUPABASE_URL = "https://dedgyznbbmkfssnrpjqg.supabase.co";

function json(res: any, status: number, body: Record<string, unknown>) {
  res.status(status).setHeader("Content-Type", "application/json");
  res.json(body);
}

async function readVerifiedEmail(userJsonUrl: string) {
  let url: URL;
  try {
    url = new URL(userJsonUrl);
  } catch {
    throw new Error("Invalid Phone.Email user reference.");
  }

  if (url.protocol !== "https:" || url.hostname !== PHONE_EMAIL_HOST) {
    throw new Error("Invalid Phone.Email user reference.");
  }

  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(8000),
  });

  if (!response.ok) throw new Error("Phone.Email verification lookup failed.");

  const text = await response.text();
  if (text.length > 64_000) throw new Error("Phone.Email response is too large.");

  let data: any;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("Phone.Email returned invalid verification data.");
  }

  const email = String(data.user_email_id ?? "").trim().toLowerCase();
  if (!email || !email.includes("@") || email.length > 320) {
    throw new Error("Phone.Email did not return a verified email address.");
  }

  return {
    email,
    firstName: String(data.user_first_name ?? "").trim(),
    lastName: String(data.user_last_name ?? "").trim(),
  };
}

async function emailHash(email: string) {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(email),
  );
  return Array.from(new Uint8Array(digest))
    .map(byte => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function findUserByEmail(admin: ReturnType<typeof createClient>, email: string) {
  for (let page = 1; page <= 100; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw error;
    const users = data.users ?? [];
    const found = users.find(user => user.email?.toLowerCase() === email.toLowerCase());
    if (found) return found;
    if (users.length < 1000) return null;
  }
  throw new Error("Unable to locate the existing account.");
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    json(res, 405, { error: "Method not allowed." });
    return;
  }

  const secretKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secretKey) {
    json(res, 500, { error: "Email login is not configured on the server." });
    return;
  }

  const userJsonUrl = String(req.body?.user_json_url ?? "").trim();
  if (!userJsonUrl) {
    json(res, 400, { error: "Missing Phone.Email verification reference." });
    return;
  }

  try {
    const verified = await readVerifiedEmail(userJsonUrl);
    const hashedEmail = await emailHash(verified.email);
    const internalEmail = `email_${hashedEmail}@email.fundedbytes.local`;
    const password = `${crypto.randomUUID()}${crypto.randomUUID()}`;

    const admin = createClient(SUPABASE_URL, secretKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    });

    const existing = await findUserByEmail(admin, internalEmail);
    const metadata = {
      auth_method: "phone_email_email",
      verified_email: verified.email,
      first_name: verified.firstName || undefined,
      last_name: verified.lastName || undefined,
    };

    let userId: string;
    if (existing) {
      const { data, error } = await admin.auth.admin.updateUserById(existing.id, {
        password,
        user_metadata: { ...existing.user_metadata, ...metadata },
      });
      if (error || !data.user) throw error ?? new Error("Unable to update email account.");
      userId = data.user.id;
    } else {
      const { data, error } = await admin.auth.admin.createUser({
        email: internalEmail,
        password,
        email_confirm: true,
        user_metadata: metadata,
      });
      if (error || !data.user) throw error ?? new Error("Unable to create email account.");
      userId = data.user.id;
    }

    const { data: session, error: signInError } = await admin.auth.signInWithPassword({
      email: internalEmail,
      password,
    });
    if (signInError || !session.session) {
      throw signInError ?? new Error("Unable to create a login session.");
    }

    json(res, 200, {
      access_token: session.session.access_token,
      refresh_token: session.session.refresh_token,
      user_id: userId,
    });
  } catch (error) {
    console.error("Phone.Email email login error:", error);
    json(res, 400, {
      error: error instanceof Error ? error.message : "Email login failed.",
    });
  }
}
