import { createHash, randomBytes } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const PHONE_EMAIL_HOST = "user.phone.email";

function json(res: any, status: number, body: Record<string, unknown>) {
  res.status(status).setHeader("Content-Type", "application/json");
  res.json(body);
}

function normalizePhone(countryCode: unknown, phoneNumber: unknown) {
  const cc = String(countryCode ?? "").trim().replace(/[^+\d]/g, "");
  const phone = String(phoneNumber ?? "").trim().replace(/\D/g, "");
  if (!phone) return "";
  const prefix = cc.startsWith("+") ? cc : cc ? `+${cc}` : "";
  return `${prefix}${phone}`;
}

async function readVerifiedPhone(userJsonUrl: string) {
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

  const phone = normalizePhone(data.user_country_code, data.user_phone_number);
  if (!phone) throw new Error("Phone.Email did not return a verified phone number.");

  return {
    phone,
    firstName: String(data.user_first_name ?? "").trim(),
    lastName: String(data.user_last_name ?? "").trim(),
  };
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
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  if (!secretKey || !supabaseUrl) {
    json(res, 500, { error: "Phone login is not configured on the server." });
    return;
  }

  const userJsonUrl = String(req.body?.user_json_url ?? "").trim();
  if (!userJsonUrl) {
    json(res, 400, { error: "Missing Phone.Email verification reference." });
    return;
  }

  try {
    const verified = await readVerifiedPhone(userJsonUrl);
    const phoneHash = createHash("sha256").update(verified.phone).digest("hex");
    const email = `phone_${phoneHash}@phone.fundedbytes.local`;
    const password = randomBytes(32).toString("base64url");

    const admin = createClient(supabaseUrl, secretKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    });

    const existing = await findUserByEmail(admin, email);
    const metadata = {
      auth_method: "phone_email",
      verified_phone: verified.phone,
      first_name: verified.firstName || undefined,
      last_name: verified.lastName || undefined,
    };

    let userId: string;
    if (existing) {
      const { data, error } = await admin.auth.admin.updateUserById(existing.id, {
        password,
        user_metadata: { ...existing.user_metadata, ...metadata },
      });
      if (error || !data.user) throw error ?? new Error("Unable to update phone account.");
      userId = data.user.id;
    } else {
      const { data, error } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: metadata,
      });
      if (error || !data.user) throw error ?? new Error("Unable to create phone account.");
      userId = data.user.id;
    }

    const { data: session, error: signInError } = await admin.auth.signInWithPassword({
      email,
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
    console.error("Phone.Email login error:", error);
    json(res, 400, {
      error: error instanceof Error ? error.message : "Phone login failed.",
    });
  }
}
