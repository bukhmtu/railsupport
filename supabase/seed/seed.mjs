// RailSupport — demo ma'lumotlar bilan Supabase loyihasini to'ldirish
//
// Ishlatish:
//   cd supabase/seed
//   cp .env.example .env   # va SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY ni to'ldiring
//   npm install
//   npm run seed

import { readFileSync, existsSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

function loadEnv() {
  if (!existsSync(new URL("./.env", import.meta.url))) return;
  const text = readFileSync(new URL("./.env", import.meta.url), "utf-8");
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim();
    if (!(key in process.env)) process.env[key] = value;
  }
}
loadEnv();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const EMAIL_DOMAIN = "railsupport.local";

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("SUPABASE_URL va SUPABASE_SERVICE_ROLE_KEY .env faylida bo'lishi kerak (.env.example ga qarang)");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const USERS = [
  { fullname: "Karimov Bobur",      username: "admin", role: "admin" },
  { fullname: "Yusupov Sardor",     username: "disp1", role: "dispatcher" },
  { fullname: "Nazarova Malika",    username: "disp2", role: "dispatcher" },
  { fullname: "Toshmatov Jasur",    username: "tech1", role: "technician" },
  { fullname: "Rakhimov Ulugbek",   username: "tech2", role: "technician" },
  { fullname: "Mirzayeva Dilnoza",  username: "user1", role: "employee" },
  { fullname: "Abdullayev Firdavs", username: "user2", role: "employee" },
];

const DEPARTMENTS = ["IT Bo'lim","Moliya","Kadrlar","Texnik xizmat","Aloqa markazi","Operatsion boshqarma","Xavfsizlik","Buxgalteriya"];

async function main() {
  console.log("Seed boshlandi...");

  // ─── Foydalanuvchilar ────────────────────────────────────────
  const userIds = {};
  for (const u of USERS) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: `${u.username}@${EMAIL_DOMAIN}`,
      password: "1234",
      email_confirm: true,
      user_metadata: { fullname: u.fullname, username: u.username, role: u.role },
    });
    if (error) {
      if (error.message.includes("already registered") || error.status === 422) {
        console.log(`  ${u.username} allaqachon mavjud, o'tkazib yuborildi`);
        const { data: existing } = await supabase.from("profiles").select("id").eq("username", u.username).single();
        if (existing) userIds[u.username] = existing.id;
        continue;
      }
      throw error;
    }
    userIds[u.username] = data.user.id;
    console.log(`  Foydalanuvchi: ${u.username} (${u.role})`);
  }

  // ─── Bo'limlar ───────────────────────────────────────────────
  const deptIds = {};
  for (const name of DEPARTMENTS) {
    const { data, error } = await supabase.from("departments").upsert({ name }, { onConflict: "name" }).select().single();
    if (error) throw error;
    deptIds[name] = data.id;
  }
  console.log(`  ${DEPARTMENTS.length} ta bo'lim tayyor`);

  // ─── Ticketlar (agar hali bo'lmasa) ──────────────────────────
  const { count } = await supabase.from("tickets").select("*", { count: "exact", head: true });
  if (count && count > 0) {
    console.log("Ticketlar allaqachon mavjud, o'tkazib yuborildi.");
  } else {
    const ticketsData = [
      { fullname:"Mirzayeva Dilnoza", department:"Moliya", phone:"+998901234567", problem_type:"Internet",
        description:"Internet ishlamayapti, sahifalar ochilmayapti", status:"tugallandi", priority:"yuqori",
        created_by_u:"user1", assigned_to_u:"tech1",
        created_at:"2025-05-14T09:15:00Z", assigned_at:"2025-05-14T09:20:00Z", resolved_at:"2025-05-14T11:30:00Z" },
      { fullname:"Abdullayev Firdavs", department:"Kadrlar", phone:"+998901234568", problem_type:"Printer",
        description:"Printer qog'oz tortmayapti", status:"jarayon", priority:"orta",
        created_by_u:"user2", assigned_to_u:"tech1",
        created_at:"2025-05-14T10:00:00Z", assigned_at:"2025-05-14T10:10:00Z" },
      { fullname:"Xasanov Mirzo", department:"Buxgalteriya", phone:"+998901234569", problem_type:"Kompyuter",
        description:"Kompyuter yoqilmayapti, qora ekran chiqyapti", status:"qabul", priority:"yuqori",
        created_by_u:"user1", assigned_to_u:"tech2",
        created_at:"2025-05-15T08:30:00Z", assigned_at:"2025-05-15T08:45:00Z" },
      { fullname:"Mirzayeva Dilnoza", department:"Moliya", phone:"+998901234567", problem_type:"Dastur ishlamayapti",
        description:"1C dasturi ishga tushmayapti, xato beradi", status:"yangi", priority:"orta",
        created_by_u:"user1", assigned_to_u:null, created_at:"2025-05-15T11:20:00Z" },
      { fullname:"Tursunov Hamid", department:"Aloqa markazi", phone:"+998901234570", problem_type:"Telefon",
        description:"IP telefon qo'ng'iroq qilmayapti", status:"yangi", priority:"past",
        created_by_u:"user2", assigned_to_u:null, created_at:"2025-05-15T12:05:00Z" },
      { fullname:"Ergasheva Nilufar", department:"IT Bo'lim", phone:"+998901234571", problem_type:"Kamera",
        description:"3-qavat kamerasi tasvirni bermayapti", status:"bekor", priority:"past",
        created_by_u:"user1", assigned_to_u:null, created_at:"2025-05-13T14:00:00Z" },
      { fullname:"Sobirov Akmal", department:"Xavfsizlik", phone:"+998901234572", problem_type:"Server",
        description:"Server xonasida harorat ko'tarilgan, ogohlantirish beryapti", status:"jarayon", priority:"yuqori",
        created_by_u:"user1", assigned_to_u:"tech1",
        created_at:"2025-05-15T13:00:00Z", assigned_at:"2025-05-15T13:05:00Z" },
    ];

    for (const td of ticketsData) {
      const { error } = await supabase.from("tickets").insert({
        fullname: td.fullname,
        department_id: deptIds[td.department],
        phone: td.phone,
        problem_type: td.problem_type,
        description: td.description,
        status: td.status,
        priority: td.priority,
        created_by: userIds[td.created_by_u],
        assigned_to: td.assigned_to_u ? userIds[td.assigned_to_u] : null,
        created_at: td.created_at,
        assigned_at: td.assigned_at ?? null,
        resolved_at: td.resolved_at ?? null,
      });
      if (error) throw error;
    }
    console.log(`  ${ticketsData.length} ta demo ticket qo'shildi`);
  }

  console.log("\n✅ Seed muvaffaqiyatli yakunlandi!");
  console.log("\nDemo login ma'lumotlari (username / parol):");
  console.log("  admin / 1234  →  Admin");
  console.log("  disp1 / 1234  →  Dispetcher");
  console.log("  tech1 / 1234  →  Texnik");
  console.log("  user1 / 1234  →  Xodim");
}

main().catch((e) => {
  console.error("Seed xato bilan to'xtadi:", e);
  process.exit(1);
});
