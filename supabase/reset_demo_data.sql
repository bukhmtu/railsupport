-- ============================================================================
-- RailSupport — Demo ma'lumotlarni tozalash
-- Ishlatish: SQL Editor'da BIR MARTA ishga tushiring.
-- Natija: faqat "admin" (username=admin) foydalanuvchisi qoladi, qolgan barcha
-- demo foydalanuvchi, bo'lim, murojaat va loglar o'chadi.
-- ⚠️ Bu qaytarib bo'lmaydigan amal — ishonch hosil qilgandan keyin ishga tushiring.
-- ============================================================================

delete from public.attachments;
delete from public.logs;
delete from public.tickets;
delete from public.departments;

delete from auth.users
where id <> (select id from public.profiles where username = 'admin' limit 1);
