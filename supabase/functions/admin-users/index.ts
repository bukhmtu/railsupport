// RailSupport — admin-users Edge Function
//
// Foydalanuvchi yaratish/parol tiklash/o'chirish service_role kalitini talab qiladi,
// shu sababli bu amallar frontenddan to'g'ridan-to'g'ri emas, shu Edge Function orqali bajariladi.
// Har bir so'rovda: chaqiruvchi tokeni tekshiriladi, profiles.role === 'admin' ekanligi tasdiqlanadi.
//
// Deploy: supabase functions deploy admin-users
// Sozlash (avtomatik mavjud): SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY

import { createClient } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const EMAIL_DOMAIN = "railsupport.local";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS_HEADERS });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace("Bearer ", "");
    if (!token) return json({ detail: "Token topilmadi" }, 401);

    // Chaqiruvchini aniqlash uchun anon-key client (foydalanuvchi tokeni bilan)
    const callerClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data: userData, error: userErr } = await callerClient.auth.getUser();
    if (userErr || !userData.user) return json({ detail: "Token noto'g'ri" }, 401);

    // Privilegiyalangan amallar uchun service_role client
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    const body = await req.json();
    const action = body.action as string;

    // ── Har qanday authenticated user o'z profilini tahrirlashi mumkin ──
    if (action === "update_own_profile") {
      const { fullname, username, password } = body;
      const updates: Record<string, unknown> = {};
      const profileUpdates: Record<string, unknown> = {};

      if (username) {
        const { data: taken } = await admin
          .from("profiles")
          .select("id")
          .eq("username", username)
          .neq("id", userData.user.id)
          .maybeSingle();
        if (taken) return json({ detail: "Bu login band" }, 400);
        updates.email = `${username}@${EMAIL_DOMAIN}`;
        profileUpdates.username = username;
      }
      if (fullname) profileUpdates.fullname = fullname;
      if (password) {
        if (password.length < 4) return json({ detail: "Parol kamida 4 ta belgidan iborat bo'lsin" }, 400);
        updates.password = password;
      }
      if (Object.keys(updates).length > 0) {
        updates.user_metadata = { ...(fullname && { fullname }), ...(username && { username }) };
        const { error } = await admin.auth.admin.updateUserById(userData.user.id, updates);
        if (error) return json({ detail: error.message }, 400);
      }
      if (Object.keys(profileUpdates).length > 0) {
        const { error } = await admin.from("profiles").update(profileUpdates).eq("id", userData.user.id);
        if (error) return json({ detail: error.message }, 400);
      }
      const { data: updatedProfile } = await admin.from("profiles").select("*").eq("id", userData.user.id).single();
      return json(updatedProfile);
    }

    // ── Qolgan amallar faqat admin uchun ──
    const { data: profile } = await admin
      .from("profiles")
      .select("role")
      .eq("id", userData.user.id)
      .single();

    if (!profile || profile.role !== "admin") {
      return json({ detail: "Ruxsat yo'q" }, 403);
    }

    if (action === "create") {
      const { fullname, username, password, role } = body;
      if (!fullname || !username || !password || !role) {
        return json({ detail: "Barcha maydonlar to'ldirilishi kerak" }, 400);
      }
      const { data: created, error } = await admin.auth.admin.createUser({
        email: `${username}@${EMAIL_DOMAIN}`,
        password,
        email_confirm: true,
        user_metadata: { fullname, username, role },
      });
      if (error) return json({ detail: error.message }, 400);
      const { data: newProfile } = await admin
        .from("profiles")
        .select("*")
        .eq("id", created.user!.id)
        .single();
      return json(newProfile, 201);
    }

    if (action === "reset_password") {
      const { user_id, password } = body;
      if (!user_id || !password) return json({ detail: "user_id va password kerak" }, 400);
      const { error } = await admin.auth.admin.updateUserById(user_id, { password });
      if (error) return json({ detail: error.message }, 400);
      return json({ ok: true });
    }

    if (action === "delete") {
      const { user_id } = body;
      if (!user_id) return json({ detail: "user_id kerak" }, 400);
      if (user_id === userData.user.id) {
        return json({ detail: "O'zingizni o'chira olmaysiz" }, 400);
      }
      const { error } = await admin.auth.admin.deleteUser(user_id);
      if (error) return json({ detail: error.message }, 400);
      return json({ ok: true });
    }

    return json({ detail: "Noma'lum action" }, 400);
  } catch (e) {
    return json({ detail: String(e) }, 500);
  }
});
