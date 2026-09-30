import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL =
  process.env.SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  "https://dedgyznbbmkfssnrpjqg.supabase.co";

function json(res: any, status: number, body: Record<string, unknown>) {
  res.status(status).setHeader("Content-Type", "application/json");
  res.json(body);
}

function secretKey() {
  return process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "";
}

function adminEmails() {
  return String(process.env.ADMIN_EMAILS || "").split(",").map(value => value.trim().toLowerCase()).filter(Boolean);
}

async function requireAdmin(req: any) {
  const secret = secretKey();
  if (!secret) throw new Error("Server admin access is not configured.");

  const authorization = String(req.headers?.authorization || "");
  if (!authorization.toLowerCase().startsWith("bearer ")) {
    const error: any = new Error("Authentication required.");
    error.status = 401;
    throw error;
  }

  const accessToken = authorization.slice(7).trim();
  const client = createClient(SUPABASE_URL, secret, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
  });
  const { data, error } = await client.auth.getUser(accessToken);
  if (error || !data.user) {
    const authError: any = new Error("Invalid session.");
    authError.status = 401;
    throw authError;
  }

  const candidates = [data.user.email, data.user.user_metadata?.verified_email, data.user.user_metadata?.email]
    .filter(Boolean).map(value => String(value).trim().toLowerCase());

  if (!candidates.some(email => adminEmails().includes(email))) {
    const forbidden: any = new Error("Admin access denied.");
    forbidden.status = 403;
    throw forbidden;
  }

  return client;
}

async function loadOverview(client: ReturnType<typeof createClient>) {
  const [{ data: accounts, error: accountsError }, { data: transactions, error: transactionsError }, { data: positions, error: positionsError }] =
    await Promise.all([
      client.from("accounts").select("id,user_id,account_number,balance,created_at,updated_at").order("created_at", { ascending: false }),
      client.from("transactions").select("*").order("created_at", { ascending: false }),
      client.from("positions").select("*").order("opened_at", { ascending: false }),
    ]);

  const firstError = accountsError || transactionsError || positionsError;
  if (firstError) throw new Error(firstError.message);

  const { data: users, error: usersError } = await client.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (usersError) throw new Error(usersError.message);

  const userMap = new Map((users.users ?? []).map(user => [user.id, {
    email: user.email,
    verifiedEmail: user.user_metadata?.verified_email,
    phone: user.user_metadata?.verified_phone,
    firstName: user.user_metadata?.first_name,
    lastName: user.user_metadata?.last_name,
  }]));

  return {
    accounts: (accounts ?? []).map(account => ({ ...account, user: userMap.get(account.user_id) ?? null })),
    transactions: transactions ?? [],
    positions: positions ?? [],
    users: users.users?.length ?? 0,
  };
}

export default async function handler(req: any, res: any) {
  try {
    const client = await requireAdmin(req);

    if (req.method === "GET") {
      json(res, 200, { ...(await loadOverview(client)), generatedAt: new Date().toISOString() });
      return;
    }

    if (req.method !== "POST") {
      json(res, 405, { error: "Method not allowed." });
      return;
    }

    const action = String(req.body?.action || "");
    const transactionId = String(req.body?.transactionId || "");
    if (!transactionId) {
      json(res, 400, { error: "Transaction ID is required." });
      return;
    }

    const { data: transaction, error: transactionError } = await client.from("transactions")
      .select("*").eq("id", transactionId).maybeSingle();
    if (transactionError) throw new Error(transactionError.message);
    if (!transaction) {
      json(res, 404, { error: "Transaction not found." });
      return;
    }
    if (transaction.status !== "Pending") {
      json(res, 409, { error: "Only pending transactions can be reviewed." });
      return;
    }

    if (action === "reject") {
      const { error } = await client.from("transactions").update({ status: "Rejected" })
        .eq("id", transactionId).eq("status", "Pending");
      if (error) throw new Error(error.message);
      json(res, 200, { ok: true });
      return;
    }

    if (action !== "approve") {
      json(res, 400, { error: "Unsupported admin action." });
      return;
    }

    const { data: account, error: accountError } = await client.from("accounts")
      .select("id,balance").eq("user_id", transaction.user_id).maybeSingle();
    if (accountError) throw new Error(accountError.message);
    if (!account) throw new Error("Trading account not found.");

    const amount = Number(transaction.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      json(res, 400, { error: "Invalid transaction amount." });
      return;
    }

    if (transaction.kind === "withdrawal" && Number(account.balance) < amount) {
      json(res, 409, { error: "Insufficient account balance for this withdrawal." });
      return;
    }

    const nextBalance = transaction.kind === "deposit"
      ? Number(account.balance) + amount
      : Number(account.balance) - amount;

    const { error: transactionUpdateError } = await client.from("transactions")
      .update({ status: "Approved" }).eq("id", transactionId).eq("status", "Pending");
    if (transactionUpdateError) throw new Error(transactionUpdateError.message);

    const { error: balanceError } = await client.from("accounts")
      .update({ balance: nextBalance, updated_at: new Date().toISOString() }).eq("id", account.id);
    if (balanceError) throw new Error(balanceError.message);

    json(res, 200, { ok: true });
  } catch (error) {
    const status = Number((error as any)?.status) || 500;
    console.error("Admin API error:", error);
    json(res, status, { error: error instanceof Error ? error.message : "Admin request failed." });
  }
}
