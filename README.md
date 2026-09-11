# TIBEX — Reklama sayti va interaktiv demo (ochiq kod)

Bu repozitoriy **TIBEX** klinika boshqaruv tizimi uchun:
1. **Reklama (landing) sayti** — loyiha, imkoniyatlar, texnologiyalar, rollar va muallif haqida ma'lumot beradi (`index.html`).
2. **To'liq interaktiv demo** — haqiqiy backend'siz, faqat HTML/CSS/JS'da yozilgan, real tizimning interfeys va ish mantiqini (state-machine, ikki bosqichli qaytarim, double-booking taqiqi va h.k.) simulyatsiya qiladi (`/app` papkasi).

Hech qanday server, baza yoki build-tool talab qilinmaydi — hammasi statik fayllar va brauzerning `localStorage`'ida ishlaydi. Shu sababli GitHub Pages'da bevosita joylashtirish mumkin.

## Demo'ni sinab ko'rish

`index.html`'ni ochib, **"Demo'ni sinab ko'rish"** tugmasini bosing yoki to'g'ridan-to'g'ri `app/login.html`'ga o'ting. Login sahifasida quyidagi demo rollar bilan bir zumda kirishingiz mumkin:

| Login | Parol | Rol |
|---|---|---|
| `admin` | `admin123` | Administrator (to'liq huquq) |
| `reception` | `demo123` | Qabulxona |
| `doctor` | `demo123` | Shifokor |
| `cashier` | `demo123` | Kassir |
| `lab` | `demo123` | Lab. shifokor |
| `assistant` | `demo123` | Yordamchi admin (faqat o'qish) |

Barcha o'zgarishlar (qo'shilgan bemor, o'zgargan qabul holati va h.k.) shu brauzerning `localStorage`'ida saqlanadi. **Sozlamalar → Demo'ni qayta tiklash** orqali istalgan vaqtda dastlabki holatga qaytarish mumkin.

## Loyiha tuzilishi

```
index.html                  # Reklama (landing) sayti
assets/
  css/tokens.css             # Rang, shrift, radius token'lari
  css/landing.css            # Landing sahifa uslubi
  css/app.css                # Demo ilova uslubi (sidebar, jadval, modal)
  js/store.js                # Soxta (mock) ma'lumotlar bazasi — localStorage
  js/ui.js                   # Umumiy UI komponentlari (sidebar, toast, modal)
  js/landing.js              # Landing sahifa animatsiyasi
app/
  login.html, dashboard.html, patients.html, patient-detail.html,
  doctors.html, appointments.html, payments.html, lab-results.html,
  reports.html, audit-log.html, settings.html
  js/*.js                    # Har bir sahifaning logikasi
```

## GitHub Pages'ga joylashtirish

1. Ushbu papkani GitHub repozitoriyasiga yuklang.
2. **Settings → Pages** bo'limida **Source**'ni `main` branch, `/ (root)` papka qilib tanlang.
3. Bir necha daqiqadan so'ng sayt `https://<username>.github.io/<repo>/` manzilida ishga tushadi.

Hech qanday `npm install` yoki build bosqichi kerak emas — bu 100% statik sayt.

## Nima uchun bu demo mavjud?

Bu sahifa odamlarga TIBEX'ning **qanday ishlashini** — sahifalar, rollar, qabul holatlari (state-machine), to'lov/qarz mantiqi va tahlil natijalarining me'yordan chetga chiqishini avtomatik aniqlashini — server o'rnatmasdan, browser orqali sinab ko'rish imkonini beradi. To'liq (backend bilan) versiya tez orada tayyor bo'ladi.

## Litsenziya

MIT — erkin foydalanish, o'zgartirish va tarqatish mumkin.
