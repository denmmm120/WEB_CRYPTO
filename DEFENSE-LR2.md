# Захист ЛР2 — шпаргалка

## 0. Перед захистом

```bash
npm install
npm run dev:vite
```

Відкрити http://localhost:5173. Паралельно відкрити проєкт у VS Code.

---

## 1. Показ у браузері (≈2 хв)

1. **Dashboard** (`index.html`): баланс, Market Watchlist (3 картки з логотипом і міні-графіком), Recent Activity.
2. Клік по **Bitcoin** у картці → відкривається **Asset Details**.
3. У меню **Assets** → таблиця з 5 монетами, пошук, фільтри. Клік по назві монети → знову Details.
4. **Profile** → форма налаштувань. Клікнути в бічному меню *Security & 2FA*, *API Keys & Wallets* → сторінка прокручується до розділу (якорі працюють).
5. Унизу клікнути **Privacy Policy** → розгортається текст (`<details>`).

> Стилів немає навмисно: за умовою ЛР2 оцінюється тільки розмітка, оформлення буде в ЛР3.

**Що показати в DevTools (F12 → Elements):**
- `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<aside>`, `<footer>`.
- У меню в активного пункту є `aria-current="page"` — він різний на кожній сторінці.
- Вкладка **Network → Img**: браузер завантажує `.webp`, а не `.png`, і саме `-64.webp` на Retina (2x).

---

## 2. Структура проєкту

```
index.html            Dashboard
assets.html           Assets (таблиця)
asset-details.html    Bitcoin details
profile.html          Account Settings
src/partials/         EJS-компоненти
  header.ejs          шапка + навігація
  footer.ejs          підвал
  crypto-card.ejs     картка монети
  coin-logo.ejs       логотип монети (<picture>)
src/data/coins.json   дані 5 монет
src/i18n/en.json      словник перекладів
public/images/        картинки webp + png
vite.config.js        збірка + підключення EJS
```

---

## 3. Компоненти та EJS

**Як підключено** — у `vite.config.js`:

```js
import { ViteEjsPlugin } from 'vite-plugin-ejs';
const coins = JSON.parse(readFileSync('src/data/coins.json'));

plugins: [ViteEjsPlugin({ coins })],
```

Плагін під час збірки проганяє кожну HTML-сторінку через EJS. Масив `coins` стає доступним у всіх сторінках.

**Як використовується на сторінці** (`index.html`):

```ejs
<%- include('src/partials/header.ejs', { page: 'dashboard' }) %>
...
<% coins.slice(0, 3).forEach((coin) => { %>
  <%- include('src/partials/crypto-card.ejs', { coin }) %>
<% }) %>
...
<%- include('src/partials/footer.ejs') %>
```

- `<%- ... %>` — вставити HTML без екранування (для include).
- `<%= ... %>` — вивести значення з екрануванням (`<%= coin.name %>`).
- `<% ... %>` — просто JS-код (цикл, умова).

**Компоненти:**

| Файл | Що робить | Параметри |
|---|---|---|
| `header.ejs` | лого, меню з 4 сторінок, кнопка мобільного меню, аватар | `page` — підсвічує активний пункт (`aria-current="page"`) |
| `footer.ejs` | копірайт, Privacy/Terms (`<details>`), Support (`mailto:`) | — |
| `crypto-card.ejs` | картка монети на Dashboard + мікророзмітка Product | `coin` |
| `coin-logo.ejs` | `<picture>` з webp/png 1x/2x | `coin`, `size`, `cls`, `alt` |

Компоненти вкладені: `crypto-card.ejs` всередині себе робить `include('coin-logo.ejs')`. Таблиця на Assets теж будується циклом по `coins` і використовує `coin-logo.ejs`.

**Навіщо:** шапка/підвал написані один раз, а не копіюються в 4 файли. Щоб додати монету — дописати рядок у `coins.json`.

---

## 4. Картинки (responsive images)

У `public/images/` — логотипи 5 монет (`btc`, `eth`, `sol`, `uni`, `mana`) і аватар, кожен у **webp** і **png**, у кількох розмірах (32/64/128, аватар 48/96).

**Варіант 1 — щільність екрана (1x / 2x)**, `coin-logo.ejs`:

```html
<picture>
  <source type="image/webp" srcset="btc-32.webp 1x, btc-64.webp 2x" />
  <img src="btc-32.png" srcset="btc-32.png 1x, btc-64.png 2x"
       width="32" height="32" alt="" loading="lazy" />
</picture>
```

- Браузер, що підтримує webp, бере `<source>`; старий — `<img>` з png.
- На звичайному екрані — 32px, на Retina — 64px.
- `width/height` — щоб сторінка не «стрибала» під час завантаження.

**Варіант 2 — ширина (w + sizes)**, логотип на `asset-details.html`:

```html
<source type="image/webp"
  srcset="btc-32.webp 32w, btc-64.webp 64w, btc-128.webp 128w"
  sizes="(min-width: 1280px) 64px, 48px" />
```

На десктопі (від 1280px) логотип 64px, на мобільному — 48px; браузер сам вибирає потрібний файл.

**alt:** у картках і таблиці `alt=""` (декоративна, поруч і так написано «Bitcoin»), на Details `alt="Bitcoin logo"`, аватар у профілі — `alt="Denys Mokhyr profile picture"`.

**Графіки** — це не картинки, а вбудований SVG `<polyline>` з точок у `coins.json` (поле `sparkline`).

---

## 5. i18n через data-атрибути

Інтерфейс англійською, але кожен текст має ключ:

```html
<a data-i18n="nav.assets">Assets</a>
<input placeholder="Search by coin name..." data-i18n-placeholder="assets.searchPlaceholder" />
<nav aria-label="Main navigation" data-i18n-aria-label="nav.mainLabel">
<img alt="Bitcoin logo" data-i18n-alt="coin.btc.logo" />
```

- `data-i18n` — текст елемента
- `data-i18n-placeholder`, `data-i18n-aria-label`, `data-i18n-alt` — атрибути
- `data-i18n-params='{"coin":"Bitcoin"}'` — підстановка в шаблон `"Trade {coin}"`

Усі ключі зібрані в `src/i18n/en.json`. Щоб додати українську — створити `uk.json` з тими ж ключами, а в ЛР4 JS пройде по `[data-i18n]` і замінить текст.

**Демо (за бажанням)** — вставити в консоль браузера на Dashboard:

```js
const uk = { 'nav.dashboard': 'Головна', 'nav.assets': 'Активи', 'nav.profile': 'Профіль',
  'dashboard.watchlist': 'Список спостереження', 'dashboard.recentActivity': 'Остання активність' };
document.querySelectorAll('[data-i18n]').forEach((el) => {
  if (uk[el.dataset.i18n]) el.textContent = uk[el.dataset.i18n];
});
```

---

## 6. Мікророзмітка schema.org

Тип **Product** (+ вкладений **Offer**) — у картках Dashboard і на Asset Details:

```html
<article itemscope itemtype="https://schema.org/Product">
  <span itemprop="name">Bitcoin</span>
  <div itemprop="offers" itemscope itemtype="https://schema.org/Offer">
    <meta itemprop="priceCurrency" content="USD" />
    <data itemprop="price" value="64250.00">$64,250.00</data>
  </div>
</article>
```

Перевірка: https://validator.schema.org → вставити HTML зі збірки (`dist/asset-details.html`).

---

## 7. Семантика й доступність — що де

| Сторінка | Головне |
|---|---|
| Dashboard | `section` ×3, `article` (картки), `ul` активності, `time datetime` |
| Assets | `h1`, `form role="search"` + `label`, фільтри `aria-pressed`, `table` з `caption`, `th scope="col"`/`scope="row"`, кнопки `aria-label="Trade Bitcoin"` |
| Asset Details | `article` (сутність), `aside` (Market Stats), `dl/dt/dd`, `figure`+`figcaption`, SVG `role="img"` |
| Profile | `aside` (картка користувача + меню), `form` з `label`, `select`, `fieldset/legend`, `table` гаманців |
| Усі | skip-link «Skip to main content», один `h1`, `aria-current="page"`, без `style=` |

Класи за **BEM**: `crypto-card__title`, `assets-table__row`, `nav__link--active`.

---

## 8. Можливі питання

- **Чому `<picture>`, а не просто `<img>`?** — щоб дати браузеру webp (легший) і png як запасний варіант.
- **Різниця 1x/2x і w/sizes?** — 1x/2x для фіксованого розміру (щільність екрана), `w`+`sizes` — коли розмір картинки залежить від ширини екрана.
- **Чому `aside` на Details?** — Market Stats — додаткова інформація збоку від основного графіка.
- **Чому `th scope="row"` у таблиці?** — назва монети — заголовок рядка, скрінрідер зачитує її з кожною клітинкою.
- **Чому посилання відносні (`./assets.html`)?** — сайт працює і локально, і на gh-pages у підпапці `/repo-name/`; в `vite.config.js` для цього `base: './'`.
- **Як збирається?** — `npm run build:vite`: спершу ESLint, потім Vite збирає 4 сторінки в `dist/`.
