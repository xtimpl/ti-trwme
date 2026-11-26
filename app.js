// =====================================================================
// app.js — Όλη η λογική της εφαρμογής.
//
// Πηγές συνταγών:
//   1) RECIPES   : οι ελληνικές συνταγές από το recipes.js (πάντα για 4 άτομα)
//   2) TheMealDB : δωρεάν API με εκατοντάδες διεθνείς συνταγές (στα Αγγλικά).
//                  Το κλειδί "1" είναι το δημόσιο δωρεάν κλειδί, δεν είναι μυστικό.
//
// Τα δεδομένα σας (ιστορικό, μενού, φίλτρα, ψώνια) τα διαχειρίζεται το store.js.
//
// Περιεχόμενα αρχείου:
//   Α. Ρυθμίσεις & λεξικά      Ε. Οθόνη «Σήμερα»
//   Β. Βοηθητικά κειμένου       ΣΤ. Οθόνη «Ψυγείο»
//   Γ. Φίλτρα ατόμων            Ζ. Οθόνη «Εβδομάδα»
//   Δ. Ιστορικό, TheMealDB,     Η. Οθόνη «Ψώνια»
//      κάρτες & παράθυρο        Θ. Οθόνη «Συνταγές» + Ξεκίνημα
// =====================================================================

// ===================== Α. ΡΥΘΜΙΣΕΙΣ & ΛΕΞΙΚΑ =====================

const MEALDB = "https://www.themealdb.com/api/json/v1/1/";

// Πόσες μέρες μετά από ένα φαγητό να ΜΗΝ το ξαναπροτείνει καθόλου
const BLOCK_DAYS = 7;
// Μετά από πόσες μέρες ένα φαγητό θεωρείται ξανά "εντελώς φρέσκια" ιδέα
const FRESH_DAYS = 35;

// Υλικά που θεωρούμε ότι υπάρχουν πάντα στο σπίτι
const STAPLES = ["αλάτι", "πιπέρι", "ελαιόλαδο", "λάδι", "νερό", "ζάχαρη", "ξύδι", "ρίγανη", "δάφνη"];

const DAYS = ["Δευτέρα", "Τρίτη", "Τετάρτη", "Πέμπτη", "Παρασκευή", "Σάββατο", "Κυριακή"];
const DAYS_SHORT = ["Δε", "Τρ", "Τε", "Πε", "Πα", "Σα", "Κυ"];

// Λίγο χιούμορ. Πρόσθεσε δικά σας αστεία εδώ!
const TAGLINES = [
  "Η αιώνια ερώτηση έχει επιτέλους απάντηση.",
  "Απαγορεύεται αυστηρά το «ό,τι θες εσύ».",
  "Σήμερα δεν τρώμε πάλι τα ίδια. Υπόσχεση.",
  "Ψυγείο μισοάδειο, καρδιά γεμάτη.",
  "Ο σεφ είναι έτοιμος. Οι βοηθοί σεφ;",
  "Το ντελίβερι δεν μετράει ως μαγείρεμα. 😏",
  "Η γιαγιά θα ήταν περήφανη.",
];
const THINKING = ["Ρωτάω τη γιαγιά… 👵", "Ξεφυλλίζω το τετράδιο συνταγών… 📒", "Ανοίγω το ψυγείο με ελπίδα… 🧊", "Μυρίζω την κατσαρόλα… 🍲"];
const COOKED_TOASTS = ["Μπράβο σεφ! 👨‍🍳 Καταγράφηκε.", "Καλή όρεξη! 😋 Μπήκε στο ιστορικό.", "Άλλο ένα πιάτο στο βιογραφικό! 🏅"];
const WHO_COOKS = [
  n => `Σήμερα μαγειρεύει ${n === CONFIG.me.name ? "ο" : "η"} ${n}! 👩‍🍳 Ο άλλος πλένει πιάτα. 🧽`,
  n => `Το νόμισμα μίλησε: ${n}. Δεν δεχόμαστε ενστάσεις. ⚖️`,
  n => `${n} στην κουζίνα! Ο/Η άλλος/η βάζει τραπέζι και κάνει κομπλιμέντα. 💐`,
];

// Μετάφραση συνηθισμένων υλικών στα Αγγλικά, για να ψάχνουμε στο TheMealDB.
const GR_TO_EN = {
  "κοτόπουλο": ["Chicken", "Chicken Breast", "Chicken Thighs"],
  "φιλέτο κοτόπουλο": ["Chicken Breast"],
  "κιμάς": ["Minced Beef", "Beef"],
  "μοσχάρι": ["Beef", "Beef Brisket"],
  "χοιρινό": ["Pork"],
  "αρνί": ["Lamb"],
  "μπέικον": ["Bacon"],
  "λουκάνικα": ["Sausages"],
  "ζαμπόν": ["Ham"],
  "σολομός": ["Salmon"],
  "τόνος": ["Tuna"],
  "μπακαλιάρος": ["Cod"],
  "γαρίδες": ["Prawns", "King Prawns"],
  "ψάρι": ["White Fish", "Cod"],
  "αυγά": ["Eggs", "Egg"],
  "γάλα": ["Milk"],
  "βούτυρο": ["Butter"],
  "κρέμα γάλακτος": ["Double Cream", "Heavy Cream"],
  "γιαούρτι": ["Greek Yogurt", "Yogurt"],
  "φέτα": ["Feta"],
  "τυρί": ["Cheese", "Cheddar Cheese"],
  "παρμεζάνα": ["Parmesan"],
  "μοτσαρέλα": ["Mozzarella"],
  "πατάτες": ["Potatoes"],
  "ντομάτες": ["Tomatoes", "Chopped Tomatoes"],
  "κρεμμύδι": ["Onion", "Onions"],
  "σκόρδο": ["Garlic", "Garlic Clove"],
  "καρότα": ["Carrots"],
  "πιπεριές": ["Red Pepper", "Green Pepper"],
  "κολοκυθάκια": ["Courgettes", "Zucchini"],
  "μελιτζάνες": ["Aubergine", "Eggplant"],
  "σπανάκι": ["Spinach"],
  "μανιτάρια": ["Mushrooms"],
  "μπρόκολο": ["Broccoli"],
  "κουνουπίδι": ["Cauliflower"],
  "λάχανο": ["Cabbage"],
  "αρακάς": ["Peas"],
  "καλαμπόκι": ["Sweetcorn"],
  "λεμόνι": ["Lemon", "Lemons"],
  "ρύζι": ["Rice", "Basmati Rice"],
  "μακαρόνια": ["Spaghetti", "Pasta"],
  "ζυμαρικά": ["Pasta", "Penne Rigate"],
  "φακές": ["Lentils", "Red Lentils"],
  "ρεβίθια": ["Chickpeas"],
  "φασόλια": ["Kidney Beans", "Cannellini Beans"],
  "αλεύρι": ["Plain Flour", "Flour"],
  "μέλι": ["Honey"],
  "αβοκάντο": ["Avocado"],
  "τζίντζερ": ["Ginger"],
};

// Μικρή "φωτογραφία" για κάθε συνταγή: emoji ανάλογα με το όνομα/υλικά, αλλιώς την κατηγορία.
const EMOJI_BY_WORD = [   // η σειρά μετράει: το πρώτο που ταιριάζει κερδίζει
  ["χούμους", "🥙"], ["σαλάτα", "🥗"], ["ταμπουλέ", "🥗"], ["σούπα", "🍲"], ["ψαρόσουπα", "🍲"], ["κοτόσουπα", "🍲"],
  ["πίτσα", "🍕"], ["χταπόδι", "🐙"], ["καλαμάρ", "🦑"], ["σουπι", "🦑"], ["γαρίδ", "🦐"], ["μύδια", "🦪"],
  ["σολομ", "🍣"], ["ψάρι", "🐟"], ["μπακαλιάρ", "🐟"], ["σαρδέλ", "🐟"], ["τσιπούρ", "🐟"], ["τόνο", "🐟"],
  ["κοτ", "🍗"], ["σουβλάκ", "🍢"], ["κεμπάπ", "🍢"], ["μπιφτέκ", "🍔"], ["κεφτ", "🧆"], ["φαλάφελ", "🧆"],
  ["αρνί", "🍖"], ["χοιριν", "🥩"], ["μοσχάρ", "🥩"], ["στιφάδο", "🥘"], ["λουκάνικ", "🌭"],
  ["μακαρ", "🍝"], ["σπαγγέτι", "🍝"], ["πένες", "🍝"], ["ζυμαρικ", "🍝"], ["καρμπονάρα", "🍝"], ["λαζάνια", "🍝"], ["νούντλς", "🍜"],
  ["ρύζι", "🍚"], ["ριζότο", "🍚"], ["κάρι", "🍛"], ["τσίλι", "🌶️"], ["φακές", "🥣"], ["σούπα", "🍲"],
  ["ομελέτα", "🍳"], ["αυγ", "🍳"], ["σακσούκα", "🍳"], ["στραπατσάδα", "🍳"], ["φριτάτα", "🍳"],
  ["πίτα", "🥧"], ["μουσακ", "🍆"], ["μελιτζ", "🍆"], ["ιμάμ", "🍆"], ["παπουτσάκια", "🍆"],
  ["γεμιστ", "🫑"], ["πατάτ", "🥔"], ["φασολάκια", "🫛"], ["αρακά", "🫛"], ["φασόλ", "🫘"], ["ρεβίθ", "🫘"], ["γίγαντες", "🫘"],
  ["φάβα", "🫘"], ["μαυρομάτικα", "🫘"], ["κολοκυθ", "🥒"], ["σπανάκ", "🥬"], ["λάχανο", "🥬"], ["λαχανο", "🥬"], ["μανιτάρ", "🍄"],
  ["τορτίγ", "🌯"], ["χαλούμι", "🧀"], ["ντολμ", "🍃"],
];
const CAT_LOOK = {   // χρώμα φόντου για κάθε κατηγορία
  "Λαδερά": "#e8f5d9", "Όσπρια": "#f5e6d3", "Κρέας": "#fde1dc", "Κοτόπουλο": "#fff0cf", "Ψάρι": "#dcefff",
  "Ζυμαρικά": "#fff4d6", "Φούρνου": "#ffe3cc", "Σούπες": "#ffeedd", "Πίτες": "#fbecc8", "Αυγά": "#fff7c2",
  "Σαλάτες": "#e3f6e3", "Ελαφριά": "#eef3e0",
};

// ===================== Β. ΒΟΗΘΗΤΙΚΑ ΚΕΙΜΕΝΟΥ =====================

// Πεζά + χωρίς τόνους + ς→σ, ώστε "Ντομάτες" και "ντοματες" να είναι ίδια.
function normalize(text) {
  return String(text).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/ς/g, "σ").trim();
}

// Πολύ απλό "κόψιμο κατάληξης": ντομάτα/ντομάτες → ντοματ, αυγό/αυγά → αυγ.
function stem(word) {
  let w = normalize(word);
  while (w.length > 3 && /[αεηιουωσ]$/.test(w)) w = w.slice(0, -1);
  return w;
}

// Από "κιμάς | 500 γρ." κρατάει το "κιμάς" (ή το "500 γρ.")
function ingName(line) { return line.split("|")[0].trim(); }
function ingQty(line) { return (line.split("|")[1] || "").trim(); }

function isStaple(name) { return STAPLES.some(s => stem(s) === stem(name)); }

// Ταιριάζει αυτό που έγραψε ο χρήστης με ένα υλικό της συνταγής;
// Κάθε λέξη του χρήστη πρέπει να ξεκινά όπως μια λέξη του υλικού.
// Η διαφορά μήκους μένει μικρή (έως 3 γράμματα), ώστε "μέλι" να ΜΗΝ πιάνει "μελιτζάνες".
function wordsMatch(a, b) {
  const [short, long] = a.length <= b.length ? [a, b] : [b, a];
  return long.startsWith(short) && long.length - short.length <= 3;
}
function ingredientMatches(userTerm, recipeIng) {
  const recipeWords = normalize(recipeIng).split(/\s+/).map(stem);
  const userWords = normalize(userTerm).split(/\s+/).map(stem);
  return userWords.every(u => recipeWords.some(r => wordsMatch(u, r)));
}

// Προστασία όταν βάζουμε κείμενο (π.χ. από το διαδίκτυο) μέσα σε HTML
function esc(text) {
  return String(text ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const $ = id => document.getElementById(id);

// Μικρό μήνυμα κάτω στην οθόνη
function toast(msg) {
  const t = $("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => t.classList.remove("show"), 2400);
}

// ===================== Γ. ΦΙΛΤΡΑ ΑΤΟΜΩΝ =====================
// Κάθε φίλτρο έχει λίστα με "απαγορευμένα" υλικά, στα Ελληνικά (για τις
// δικές μας συνταγές) και στα Αγγλικά (για το TheMealDB).
// Οι συνταγές ΔΕΝ σβήνονται· απλώς κρύβονται όταν το φίλτρο είναι ανοιχτό.

const SAFE_GR = ["γάλα καρύδας"];
const SAFE_EN = ["coconut milk", "coconut cream", "almond milk", "oat milk", "soy milk", "peanut butter",
                 "butter beans", "kidney beans"];

const FILTERS = {
  christos: {
    face: "😇", title: () => "Νηστεύει ο " + CONFIG.me.name, sub: "χωρίς κρέας, ψάρι, αυγά, γαλακτοκομικά",
    // Κρέας, ψάρι, αυγά, γαλακτοκομικά. Το λάδι επιτρέπεται.
    // Τα θαλασσινά (γαρίδες, καλαμάρια, χταπόδι, σουπιές, μύδια) θεωρούνται νηστίσιμα,
    // όπως στην ορθόδοξη νηστεία. Αν δεν τα τρως, πρόσθεσέ τα στη λίστα gr και en.
    gr: ["κοτόπουλο", "κιμάς", "μοσχάρι", "χοιρινό", "χοιρινές", "αρνί", "μπέικον", "λουκάνικα", "ζαμπόν",
         "συκωτάκια", "ψάρι", "σολομός", "τόνος", "μπακαλιάρος", "τσιπούρα", "σαρδέλες",
         "αυγά", "γάλα", "βούτυρο", "κρέμα γάλακτος", "γιαούρτι", "φέτα", "τυρί", "παρμεζάνα",
         "μοτσαρέλα", "μυζήθρα", "χαλούμι", "κασέρι", "μαγιονέζα", "τραχανάς", "χυλοπίτες"],
    en: ["chicken", "beef", "pork", "lamb", "mutton", "veal", "goat", "bacon", "sausage", "sausages", "ham",
         "mince", "minced", "turkey", "duck", "chorizo", "prosciutto", "pancetta", "salami", "pepperoni",
         "liver", "kidney", "kidneys", "gelatine", "lard", "suet", "venison", "steak", "brisket", "oxtail",
         "fish", "salmon", "tuna", "cod", "haddock", "mackerel", "sardines", "anchovy", "anchovies", "trout",
         "tilapia", "sea bass", "monkfish", "herring", "kipper", "plaice", "sole", "pilchards",
         "egg", "eggs", "milk", "butter", "cream", "cheese", "yogurt", "yoghurt", "parmesan", "mozzarella",
         "cheddar", "feta", "ricotta", "mascarpone", "creme fraiche", "crème fraîche", "ghee", "buttermilk",
         "brie", "gruyère", "gruyere", "paneer", "stilton", "custard", "mayonnaise", "condensed milk"],
  },
  nikoleta: {
    face: "👑", title: () => "Τρώει και η " + CONFIG.her.name, sub: "χωρίς ψάρι, μελιτζάνα, μανιτάρια",
    // Ψάρι, μελιτζάνα, μανιτάρια. (Τα θαλασσινά ΔΕΝ αποκλείονται· πρόσθεσέ τα αν χρειάζεται.)
    gr: ["ψάρι", "σολομός", "τόνος", "μπακαλιάρος", "τσιπούρα", "σαρδέλες", "μελιτζάνες", "μανιτάρια"],
    en: ["fish", "salmon", "tuna", "cod", "haddock", "mackerel", "sardines", "anchovy", "anchovies", "trout",
         "tilapia", "sea bass", "monkfish", "herring", "kipper", "plaice", "sole", "pilchards",
         "aubergine", "aubergines", "eggplant", "mushroom", "mushrooms"],
  },
};

// Ελέγχει αν ΕΝΑ υλικό (ελληνικό ή αγγλικό) χτυπάει σε κάποιο απαγορευμένο του φίλτρου
function ingredientBlocked(filter, name) {
  const isEnglish = /^[\x00-\x7FÀ-ÿ\s]+$/.test(name);
  if (isEnglish) {
    let text = " " + name.toLowerCase() + " ";
    SAFE_EN.forEach(s => { text = text.replace(s, " "); });
    // ολόκληρη λέξη, ώστε "egg" να μην πιάνει το "eggplant"
    return filter.en.some(w => new RegExp("\\b" + w + "\\b").test(text));
  }
  if (SAFE_GR.some(s => normalize(name).includes(normalize(s)))) return false;
  return filter.gr.some(w => ingredientMatches(w, name));
}

// true αν η συνταγή περνάει ΟΛΑ τα ανοιχτά φίλτρα
function passesFilters(recipe) {
  const on = Store.state.filters || {};
  return Object.keys(FILTERS).every(id =>
    !on[id] || !recipe.ing.some(line => ingredientBlocked(FILTERS[id], ingName(line))));
}

function isFasting(recipe) {
  return !recipe.ing.some(line => ingredientBlocked(FILTERS.christos, ingName(line)));
}

function renderFilterButtons() {
  const box = $("personFilters");
  box.innerHTML = "";
  Object.entries(FILTERS).forEach(([id, f]) => {
    const b = document.createElement("button");
    b.className = "pf" + (Store.state.filters[id] ? " on" : "");
    b.innerHTML = `<span class="face">${f.face}</span><span><b>${esc(f.title())}</b><small>${esc(f.sub)}</small></span>`;
    b.onclick = () => {
      Store.state.filters = { ...Store.state.filters, [id]: !Store.state.filters[id] };
      Store.save();
      toast(Store.state.filters[id] ? `${f.face} Φίλτρο ενεργό` : "Φίλτρο κλειστό");
      // Ξαναβγάζουμε τα αποτελέσματα αν ήδη φαίνονται κάποια
      if ($("suggestResults").querySelector(".card")) suggest();
      if ($("pantryResults").querySelector(".card")) findByPantry();
    };
    box.appendChild(b);
  });
}

// ===================== Δ. ΙΣΤΟΡΙΚΟ, THEMEALDB, ΚΑΡΤΕΣ =====================

const keyOf = r => r.key || "local:" + r.name;

function addToHistory(recipe) {
  Store.state.history = [{ key: keyOf(recipe), name: recipe.name, date: new Date().toISOString().slice(0, 10) }, ...Store.state.history];
  Store.save();
}

// Πόσες μέρες πέρασαν από την τελευταία φορά (ή null αν δεν το φτιάξατε ποτέ)
function daysSince(key) {
  const entry = Store.state.history.find(h => h.key === key);
  if (!entry) return null;
  return Math.floor((Date.now() - new Date(entry.date).getTime()) / 86400000);
}

// "Βάρος" στην κλήρωση: 0 = καθόλου, 1 = κανονικά. Όσο πιο πρόσφατο, τόσο πιο σπάνιο.
function weightFor(key) {
  const d = daysSince(key);
  if (d === null) return 1;
  if (d < BLOCK_DAYS) return 0;
  return Math.min(1, (d - BLOCK_DAYS + 1) / (FRESH_DAYS - BLOCK_DAYS));
}

// Διαλέγει n διαφορετικά στοιχεία, με βάση τα βάρη τους
function pickWeighted(items, weightFn, n) {
  const pool = items.map(it => ({ it, w: weightFn(it) })).filter(x => x.w > 0);
  const picked = [];
  while (picked.length < n && pool.length) {
    let r = Math.random() * pool.reduce((s, x) => s + x.w, 0);
    let idx = pool.findIndex(x => (r -= x.w) <= 0);
    if (idx === -1) idx = pool.length - 1;
    picked.push(pool[idx].it);
    pool.splice(idx, 1);
  }
  return picked;
}

async function mealdb(path) {
  const res = await fetch(MEALDB + path);
  if (!res.ok) throw new Error("TheMealDB error");
  const data = await res.json();
  return data.meals || [];   // όταν δεν βρει τίποτα επιστρέφει null
}

// Μετατρέπει μια συνταγή του TheMealDB στη δική μας μορφή
function mealToRecipe(meal) {
  const ing = [];
  for (let i = 1; i <= 20; i++) {
    const n = meal["strIngredient" + i];
    if (n && n.trim()) ing.push(n.trim() + " | " + (meal["strMeasure" + i] || "").trim());
  }
  return {
    key: "mealdb:" + meal.idMeal, name: meal.strMeal, cat: meal.strCategory, area: meal.strArea,
    img: meal.strMealThumb, youtube: meal.strYoutube, online: true, ing,
    steps: (meal.strInstructions || "").split(/\r?\n+/).map(s => s.replace(/^step\s*\d+[:.]?\s*/i, "").trim()).filter(s => s.length > 2),
  };
}

// Τυχαία διεθνής συνταγή που δεν φτιάξατε πρόσφατα και περνάει τα φίλτρα
async function randomOnlineMeal(excludeIds) {
  for (let i = 0; i < 10; i++) {
    const [meal] = await mealdb("random.php");
    if (!meal || excludeIds.has(meal.idMeal)) continue;
    const r = mealToRecipe(meal);
    if (!passesFilters(r)) continue;
    if (Math.random() < weightFor(r.key)) return r;
  }
  return null;
}

// Από ελληνικό υλικό → λίστα με πιθανά αγγλικά ονόματα
function toEnglish(term) {
  const s = normalize(term).split(/\s+/).map(stem).join(" ");
  for (const gr in GR_TO_EN) {
    if (normalize(gr).split(/\s+/).map(stem).join(" ") === s) return GR_TO_EN[gr];
  }
  return /^[a-z\s]+$/i.test(term) ? [term] : [];   // ίσως το έγραψες ήδη στα Αγγλικά
}

function emojiFor(recipe) {
  const n = normalize(recipe.name);
  const hit = EMOJI_BY_WORD.find(([w]) => n.includes(normalize(w)));
  return hit ? hit[1] : "🍽️";
}

// Το "πιάτο": φωτογραφία (TheMealDB) ή emoji σε χρωματιστό φόντο
function plateHtml(recipe, big = false) {
  const bg = CAT_LOOK[recipe.cat] || "#fdeee6";
  const emoji = emojiFor(recipe);
  if (recipe.img) {
    const src = esc(recipe.img) + (big ? "" : "/preview");
    // αν η εικόνα δεν φορτώσει, δείχνουμε το emoji
    return `<div class="${big ? "sheet-hero" : "plate"}" style="background:${bg}"><img src="${src}" alt="" loading="lazy" onerror="this.replaceWith(document.createTextNode('${emoji}'))"></div>`;
  }
  return `<div class="${big ? "sheet-hero" : "plate"}" style="background:${bg}">${emoji}</div>`;
}

function tagsHtml(recipe) {
  const t = [];
  if (recipe.time) t.push(`<span class="tag">⏱ ${recipe.time >= 60 ? (recipe.time / 60).toString().replace(".", ",") + " ώρ." : recipe.time + "'"}</span>`);
  if (recipe.ing && isFasting(recipe)) t.push('<span class="tag fast">🌱 νηστίσιμο</span>');
  if (recipe.online) t.push('<span class="tag en">🌍 EN</span>');
  const d = daysSince(keyOf(recipe));
  if (d !== null) t.push(`<span class="tag recent">${d === 0 ? "φάγαμε σήμερα" : d === 1 ? "φάγαμε χθες" : "πριν " + d + " μέρες"}</span>`);
  return `<div class="tags">${t.join("")}</div>`;
}

// Δημιουργεί μια κάρτα. extraHtml = επιπλέον γραμμές, onNo = κουμπί "όχι αυτό"
function cardFor(recipe, extraHtml = "", onNo = null) {
  const div = document.createElement("div");
  div.className = "card";
  div.innerHTML = `
    ${plateHtml(recipe)}
    <div>
      <h3>${esc(recipe.name)}</h3>
      <div class="meta">${esc(recipe.cat || "")}${recipe.area ? " · " + esc(recipe.area) : ""}</div>
      ${tagsHtml(recipe)}
      ${extraHtml}
    </div>
    ${onNo ? '<div class="acts"><button class="yes">😍 Αυτό!</button><button class="no">🙅 Όχι σήμερα</button></div>' : ""}`;
  div.onclick = () => openRecipe(recipe);
  if (onNo) div.querySelector(".no").onclick = e => { e.stopPropagation(); onNo(div); };
  return div;
}

// Φέρνει τις πλήρεις λεπτομέρειες μιας συνταγής TheMealDB αν λείπουν
async function fullRecipe(recipe) {
  if (recipe.online && !recipe.steps) {
    const [meal] = await mealdb("lookup.php?i=" + recipe.key.split(":")[1]);
    if (meal) return mealToRecipe(meal);
  }
  return recipe;
}

// Ανοίγει το παράθυρο με τη συνταγή
async function openRecipe(recipe) {
  try { recipe = await fullRecipe(recipe); } catch { toast("Δεν φορτώνει τώρα το TheMealDB 😕"); return; }
  const key = keyOf(recipe);
  const body = $("sheetBody");

  const links = recipe.online
    ? `<p class="links"><a target="_blank" rel="noopener" href="https://translate.google.com/?sl=en&tl=el&op=translate&text=${encodeURIComponent((recipe.name + "\n\n" + recipe.ing.join("\n") + "\n\n" + recipe.steps.join("\n")).slice(0, 4500))}">🌐 Μετάφραση στα Ελληνικά</a>
       ${recipe.youtube ? ` · <a target="_blank" rel="noopener" href="${esc(recipe.youtube)}">▶️ Βίντεο</a>` : ""}</p>
       <p class="note">Οι ποσότητες είναι όπως στην αρχική συνταγή (συνήθως για 4).</p>`
    : "";

  const planDays = Store.state.plan.map((p, i) => p && p.key === key ? i : -1).filter(i => i >= 0);

  body.innerHTML = `
    ${plateHtml(recipe, true)}
    <div class="sheet-in">
      <h2>${esc(recipe.name)}</h2>
      <div class="meta">${esc(recipe.cat || "")}${recipe.time ? " · ~" + recipe.time + " λεπτά" : ""} · 👥 για 4 άτομα</div>
      ${tagsHtml(recipe)}
      ${links}
      <h3>🛒 Υλικά</h3>
      <ul class="ings">${recipe.ing.map(l => `<li><span>${esc(ingName(l))}</span><span>${esc(ingQty(l))}</span></li>`).join("")}</ul>
      <h3>👩‍🍳 Εκτέλεση</h3>
      <ol class="steps">${recipe.steps.map(s => `<li>${esc(s)}</li>`).join("")}</ol>
      <h3>📅 Βάλ' το στο μενού</h3>
      <div class="daypick">${DAYS_SHORT.map((d, i) => `<button data-day="${i}" class="${planDays.includes(i) ? "in" : ""}">${d}</button>`).join("")}</div>
      <p></p>
      <button class="cta" id="cookedBtn" style="background:var(--basil);box-shadow:0 6px 0 #237a34">✓ Το φάγαμε σήμερα!</button>
    </div>`;

  body.querySelectorAll(".daypick button").forEach(b => {
    b.onclick = () => {
      setPlanDay(Number(b.dataset.day), recipe);
      body.querySelectorAll(".daypick button").forEach(x => x.classList.toggle("in", x === b || (Store.state.plan[x.dataset.day] || {}).key === key));
      toast(`📅 Μπήκε ${DAYS[b.dataset.day] === "Σάββατο" ? "το" : "την"} ${DAYS[b.dataset.day]}`);
    };
  });
  $("cookedBtn").onclick = () => {
    addToHistory(recipe);
    $("cookedBtn").textContent = "Καταγράφηκε! 😋";
    toast(pick(COOKED_TOASTS));
  };
  $("sheet").showModal();
  $("sheet").scrollTop = 0;
}

// ===================== Ε. ΟΘΟΝΗ «ΣΗΜΕΡΑ» =====================

let shownKeys = new Set();   // ό,τι έχει ήδη δείξει, για να μη βγάζει τα ίδια με το "Όχι σήμερα"

function localCandidates() {
  const cat = $("catFilter").value;
  const maxTime = Number($("timeFilter").value) || Infinity;
  return RECIPES.filter(r => (!cat || r.cat === cat) && r.time <= maxTime && passesFilters(r));
}

async function suggest() {
  const out = $("suggestResults");
  out.innerHTML = `<p class="empty">${pick(THINKING)}</p>`;
  shownKeys = new Set();
  const useOnline = $("useOnline").checked;

  // Με TheMealDB: 2 ελληνικές + 2 διεθνείς. Χωρίς: 4 ελληνικές.
  const local = pickWeighted(localCandidates(), r => weightFor(keyOf(r)), useOnline ? 2 : 4);
  const cards = [...local];
  local.forEach(r => shownKeys.add(keyOf(r)));

  if (useOnline) {
    try {
      for (let i = 0; i < 2; i++) {
        const r = await randomOnlineMeal(new Set([...shownKeys].map(k => k.split(":")[1])));
        if (r) { cards.push(r); shownKeys.add(r.key); }
      }
    } catch {
      toast("Το TheMealDB δεν απαντάει. Μόνο ελληνικά σήμερα! 🇬🇷");
    }
  }

  out.innerHTML = "";
  if (!cards.length) {
    out.innerHTML = '<div class="empty"><div class="big-emoji">🤷</div>Τίποτα με αυτά τα φίλτρα. Μήπως είστε πολύ αυστηροί;</div>';
    return;
  }
  cards.forEach(r => out.appendChild(cardFor(r, "", div => replaceSuggestion(div, r))));
}

// "Όχι σήμερα": αλλάζει μόνο αυτή την κάρτα με μια άλλη ίδιου τύπου
async function replaceSuggestion(div, old) {
  let next = null;
  try {
    if (old.online) next = await randomOnlineMeal(new Set([...shownKeys].map(k => k.split(":")[1])));
    else next = pickWeighted(localCandidates().filter(r => !shownKeys.has(keyOf(r))), r => weightFor(keyOf(r)), 1)[0];
  } catch {}
  if (!next) { toast("Τελείωσαν οι ιδέες με αυτά τα φίλτρα! 😅"); return; }
  shownKeys.add(keyOf(next));
  div.replaceWith(cardFor(next, "", d => replaceSuggestion(d, next)));
}

function whoCooks() {
  const name = Math.random() < 0.5 ? CONFIG.me.name : CONFIG.her.name;
  $("whoCooksResult").textContent = "🪙 …";
  setTimeout(() => { $("whoCooksResult").textContent = pick(WHO_COOKS)(name); }, 600);
}

// ===================== ΣΤ. ΟΘΟΝΗ «ΨΥΓΕΙΟ» =====================

let pantry = [];

function renderChips() {
  const box = $("ingChips");
  box.innerHTML = "";
  pantry.forEach((p, i) => {
    const chip = document.createElement("span");
    chip.className = "chip";
    chip.textContent = p + " ✕";
    chip.onclick = () => { pantry.splice(i, 1); renderChips(); };
    box.appendChild(chip);
  });
}

function addIngredient(text) {
  text.split(",").map(t => t.trim()).filter(Boolean).forEach(t => {
    if (!pantry.some(p => normalize(p) === normalize(t))) pantry.push(t);
  });
  renderChips();
}

function scoreRecipe(recipe) {
  const needed = recipe.ing.map(ingName).filter(n => !isStaple(n));
  const have = needed.filter(n => pantry.some(p => ingredientMatches(p, n)));
  return { recipe, have, missing: needed.filter(n => !have.includes(n)) };
}

async function findByPantry() {
  const out = $("pantryResults");
  if (!pantry.length) { out.innerHTML = '<div class="empty"><div class="big-emoji">🧊</div>Άδειο ψυγείο; Πρόσθεσε πρώτα μερικά υλικά.</div>'; return; }
  out.innerHTML = `<p class="empty">${pick(THINKING)}</p>`;

  // --- Ελληνικές: 2 πόντοι για κάθε υλικό που έχεις, -1 για κάθε υλικό που λείπει ---
  const scored = RECIPES.filter(passesFilters).map(scoreRecipe)
    .filter(s => s.have.length > 0)
    .sort((a, b) => (b.have.length * 2 - b.missing.length) - (a.have.length * 2 - a.missing.length)
                 || weightFor(keyOf(b.recipe)) - weightFor(keyOf(a.recipe)))
    .slice(0, 15);

  out.innerHTML = '<h3 class="sub">🇬🇷 Ελληνικές συνταγές</h3>';
  if (!scored.length) out.innerHTML += '<p class="empty">Καμία δεν ταιριάζει. Ώρα για σουπερμάρκετ; 🛒</p>';
  scored.forEach(s => {
    const extra = `<div class="have">✓ ${esc(s.have.join(", "))}</div>` +
      (s.missing.length ? `<div class="missing">✗ Λείπουν: ${esc(s.missing.join(", "))}</div>` : `<div class="have"><b>Τα έχεις όλα! 🎉</b></div>`);
    out.appendChild(cardFor(s.recipe, extra));
  });

  // --- TheMealDB ---
  if (!$("pantryOnline").checked) return;
  const box = document.createElement("div");
  box.innerHTML = '<h3 class="sub">🌍 Διεθνείς συνταγές</h3><p class="hint">Φορτώνει…</p>';
  out.appendChild(box);

  // Για κάθε υλικό ρωτάμε ποιες συνταγές το έχουν, και μετράμε πόσα από τα υλικά σου ταιριάζουν
  const counts = {};
  const searchable = pantry.filter(p => toEnglish(p).length);
  try {
    for (const p of searchable) {
      const found = new Map();
      for (const en of toEnglish(p)) {
        (await mealdb("filter.php?i=" + encodeURIComponent(en.replace(/ /g, "_")))).forEach(m => found.set(m.idMeal, m));
      }
      found.forEach((m, id) => { counts[id] = counts[id] || { meal: m, n: 0 }; counts[id].n++; });
    }
  } catch {
    box.innerHTML = '<h3 class="sub">🌍 Διεθνείς συνταγές</h3><p class="hint">Το TheMealDB δεν απαντάει τώρα.</p>';
    return;
  }

  let best = Object.values(counts).sort((a, b) => b.n - a.n || Math.random() - 0.5);
  // Αν υπάρχει ανοιχτό φίλτρο, φέρνουμε τα πλήρη υλικά των 25 καλύτερων για να πετάξουμε όσες δεν περνάνε
  if (Object.values(Store.state.filters).some(Boolean)) {
    const top = best.slice(0, 25);
    const details = await Promise.all(top.map(b => mealdb("lookup.php?i=" + b.meal.idMeal).catch(() => [])));
    best = top.filter((b, i) => details[i][0] && passesFilters(mealToRecipe(details[i][0])));
  }
  best = best.slice(0, 10);

  box.innerHTML = '<h3 class="sub">🌍 Διεθνείς συνταγές</h3>';
  if (!searchable.length) box.innerHTML += '<p class="hint">Δεν ξέρω πώς να μεταφράσω αυτά τα υλικά. Δοκίμασε π.χ. κοτόπουλο, ρύζι, ή γράψ\' τα στα Αγγλικά.</p>';
  else if (!best.length) box.innerHTML += '<p class="empty">Δεν βρέθηκε κάτι.</p>';
  best.forEach(({ meal, n }) => {
    const r = { key: "mealdb:" + meal.idMeal, name: meal.strMeal, img: meal.strMealThumb, online: true };
    box.appendChild(cardFor(r, `<div class="have">Ταιριάζει σε ${n} από ${searchable.length} υλικά σου</div>`));
  });
}

// ===================== Ζ. ΟΘΟΝΗ «ΕΒΔΟΜΑΔΑ» =====================
// Στο μενού κρατάμε για ελληνικές μόνο { key, name } (τα υπόλοιπα είναι στο recipes.js)
// και για TheMealDB όλα τα στοιχεία, για να βγαίνει η λίστα ψωνιών χωρίς ίντερνετ.

function planRef(recipe) {
  if (!recipe.online) return { key: keyOf(recipe), name: recipe.name };
  const { key, name, img, cat, ing, online } = recipe;
  return { key, name, img: img || "", cat: cat || "", ing: ing || [], online };
}
function resolvePlan(ref) {
  if (!ref) return null;
  if (ref.online) return ref;
  return RECIPES.find(r => r.name === ref.name) || null;
}

async function setPlanDay(i, recipe) {
  if (recipe && recipe.online && !recipe.ing) recipe = await fullRecipe(recipe);
  const plan = [...Store.state.plan];
  plan[i] = recipe ? planRef(recipe) : null;
  Store.state.plan = plan;
  Store.save();
}

// Διαλέγει συνταγή για το μενού: όχι πρόσφατη, όχι ήδη στο μενού, όχι 3η φορά ίδια κατηγορία
function pickForPlan() {
  const inPlan = new Set(Store.state.plan.filter(Boolean).map(p => p.key));
  const catCount = {};
  Store.state.plan.forEach(p => { const r = resolvePlan(p); if (r && r.cat) catCount[r.cat] = (catCount[r.cat] || 0) + 1; });
  const pool = RECIPES.filter(r => passesFilters(r) && !inPlan.has(keyOf(r)) && (catCount[r.cat] || 0) < 2);
  return pickWeighted(pool, r => weightFor(keyOf(r)), 1)[0] || null;
}

function fillWeek() {
  const plan = [...Store.state.plan];
  for (let i = 0; i < 7; i++) {
    if (plan[i]) continue;
    Store.state.plan = plan;          // ώστε το pickForPlan να βλέπει τις προηγούμενες επιλογές
    const r = pickForPlan();
    if (r) plan[i] = planRef(r);
  }
  Store.state.plan = plan;
  Store.save();
  toast("✨ Έτοιμο το μενού! Αλλάξτε ό,τι δεν σας αρέσει.");
}

function renderWeek() {
  const box = $("weekList");
  box.innerHTML = "";
  const todayIdx = (new Date().getDay() + 6) % 7;   // Δευτέρα = 0
  DAYS.forEach((day, i) => {
    const r = resolvePlan(Store.state.plan[i]);
    const div = document.createElement("div");
    div.className = "day" + (i === todayIdx ? " today" : "") + (r ? "" : " emptyday");
    div.innerHTML = `
      <div class="dayname">${day.slice(0, 3)}<span>${i === todayIdx ? "⭐" : ""}</span></div>
      ${r ? plateHtml(r) : '<div class="plate">➕</div>'}
      <div class="name">${r ? esc(r.name) : '<span class="meta">Ελεύθερη μέρα (ή σουβλάκια 😏)</span>'}</div>
      <div class="ops">
        <button title="Άλλη πρόταση" data-act="dice">🎲</button>
        ${r ? '<button title="Αφαίρεση" data-act="del">✕</button>' : ""}
      </div>`;
    div.querySelector(".name").onclick = () => r ? openRecipe(r) : setPlanDay(i, pickForPlan());
    div.querySelector(".plate").onclick = div.querySelector(".name").onclick;
    div.querySelector("[data-act=dice]").onclick = () => setPlanDay(i, pickForPlan());
    const del = div.querySelector("[data-act=del]");
    if (del) del.onclick = () => setPlanDay(i, null);
    box.appendChild(div);
  });
}

// ===================== Η. ΟΘΟΝΗ «ΨΩΝΙΑ» =====================
// Ενώνει τα υλικά όλων των συνταγών του μενού και αθροίζει ποσότητες ίδιας μονάδας.

// Μονάδες: [αρχή λέξης, όνομα μονάδας, πολλαπλασιαστής]
const UNITS = [
  ["κιλ", "γρ.", 1000], ["γρ", "γρ.", 1], ["λιτρ", "ml", 1000], ["ml", "ml", 1],
  ["φλ", "φλ.", 1], ["κ.σ", "κ.σ.", 1], ["κ.γ", "κ.γ.", 1], ["σκελιδ", "σκελίδες", 1],
  ["ματσακ", "ματσάκια", 1], ["κονσερβ", "κονσέρβες", 1], ["πακετ", "πακέτα", 1], ["ποτηρ", "ποτήρια", 1],
  ["φυλλ", "φύλλα", 1], ["φιλετ", "φιλέτα", 1], ["φακελακ", "φακελάκια", 1], ["φετ", "φέτες", 1],
];

// "1/2 φλ." → { n: 0.5, unit: "φλ." }, "1,2 κιλό σε μερίδες" → { n: 1200, unit: "γρ." }
function parseQty(q) {
  const m = q.trim().match(/^(\d+(?:[.,]\d+)?)(?:\s*\/\s*(\d+))?\s*(.*)$/);
  if (!m) return null;
  let n = parseFloat(m[1].replace(",", "."));
  if (m[2]) n = n / Number(m[2]);
  const rest = normalize(m[3]);
  for (const [start, unit, mult] of UNITS) {
    if (rest.startsWith(start)) return { n: n * mult, unit };
  }
  // Αγγλικές μονάδες TheMealDB (tbsp, cup…): τις κρατάμε όπως είναι
  if (/^[a-z]/.test(rest)) return { n, unit: m[3].split(" ")[0] };
  return { n, unit: "" };   // απλά τεμάχια
}

function fmtNum(n) { return (Math.round(n * 100) / 100).toString().replace(".", ","); }
function fmtAmount(n, unit) {
  if (unit === "γρ." && n >= 1000) return fmtNum(n / 1000) + " κιλό";
  if (unit === "ml" && n >= 1000) return fmtNum(n / 1000) + " λίτρο";
  return (fmtNum(n) + " " + unit).trim();
}

function buildShoppingList() {
  const items = {};   // stem → { name, sums: {unit: n}, vague: bool, recipes: Set }
  Store.state.plan.map(resolvePlan).filter(Boolean).forEach(r => {
    r.ing.forEach(line => {
      const name = ingName(line);
      const key = normalize(name).split(/\s+/).map(stem).join(" ");
      const it = items[key] = items[key] || { key, name, sums: {}, vague: false, recipes: new Set() };
      it.recipes.add(r.name);
      const q = parseQty(ingQty(line));
      if (q) it.sums[q.unit] = (it.sums[q.unit] || 0) + q.n;
      else it.vague = true;   // "λίγος", "για σερβίρισμα"
    });
  });
  return Object.values(items).map(it => {
    const parts = Object.entries(it.sums).map(([u, n]) => fmtAmount(n, u));
    if (it.vague && !parts.length) parts.push("λίγο");
    return { ...it, qty: parts.join(" + "), staple: isStaple(it.name) };
  }).sort((a, b) => a.name.localeCompare(b.name, "el"));
}

function renderShop() {
  const box = $("shopList");
  const list = buildShoppingList();
  if (!list.length) {
    box.innerHTML = '<div class="empty"><div class="big-emoji">🛒</div>Άδεια λίστα. Φτιάξε πρώτα μενού στην «Εβδομάδα».</div>';
    return;
  }
  const checked = new Set(Store.state.shopChecked || []);
  const group = (title, arr) => !arr.length ? "" : `<div class="shopgroup"><h3>${title}</h3>${arr.map(it => `
      <label class="shopitem ${checked.has(it.key) ? "done" : ""}">
        <input type="checkbox" data-key="${esc(it.key)}" ${checked.has(it.key) ? "checked" : ""}>
        <span style="flex:1"><span class="n">${esc(it.name)}</span> <span class="q">${esc(it.qty)}</span>
        <span class="for">για: ${esc([...it.recipes].join(", "))}</span></span>
      </label>`).join("")}</div>`;
  box.innerHTML = group("Να πάρουμε", list.filter(i => !i.staple)) + group("Μάλλον τα έχετε (τσεκάρετε)", list.filter(i => i.staple));
  box.querySelectorAll("input").forEach(cb => {
    cb.onchange = () => {
      const s = new Set(Store.state.shopChecked || []);
      cb.checked ? s.add(cb.dataset.key) : s.delete(cb.dataset.key);
      Store.state.shopChecked = [...s];
      Store.save();
    };
  });
}

async function copyShop() {
  const checked = new Set(Store.state.shopChecked || []);
  const text = "🛒 Ψώνια εβδομάδας\n" + buildShoppingList()
    .filter(i => !checked.has(i.key) && !i.staple)
    .map(i => `• ${i.name} — ${i.qty}`).join("\n");
  try { await navigator.clipboard.writeText(text); toast("📋 Αντιγράφηκε! Στείλ' το στο Viber."); }
  catch { toast("Δεν επιτρέπεται η αντιγραφή εδώ 😕"); }
}

// ===================== Θ. ΟΘΟΝΗ «ΣΥΝΤΑΓΕΣ» + ΙΣΤΟΡΙΚΟ =====================

function renderAll() {
  const q = normalize($("searchInput").value);
  const list = $("allList");
  list.innerHTML = "";
  RECIPES
    .filter(passesFilters)
    .filter(r => !q || normalize(r.name).includes(q) || r.ing.some(l => normalize(ingName(l)).includes(q)))
    .sort((a, b) => a.name.localeCompare(b.name, "el"))
    .forEach(r => {
      const item = document.createElement("div");
      item.className = "item";
      item.innerHTML = `<span class="em">${emojiFor(r)}</span><span class="txt">${esc(r.name)}<br><span class="meta">${esc(r.cat)} · ${r.time}'</span></span>`;
      item.onclick = () => openRecipe(r);
      list.appendChild(item);
    });
}

function renderHistory() {
  const list = $("historyList");
  const history = Store.state.history;
  list.innerHTML = history.length ? "" : '<div class="empty"><div class="big-emoji">📭</div>Ακόμα τίποτα. Το ντελίβερι δεν μετράει. 😏</div>';
  history.forEach((h, i) => {
    const item = document.createElement("div");
    item.className = "item";
    item.innerHTML = `<span class="em">${emojiFor(h)}</span><span class="txt">${esc(h.name)}<br><span class="meta">${new Date(h.date).toLocaleDateString("el-GR", { weekday: "long", day: "numeric", month: "long" })}</span></span>`;
    const del = document.createElement("button");
    del.textContent = "🗑";
    del.onclick = e => {
      e.stopPropagation();
      Store.state.history = Store.state.history.filter((_, j) => j !== i);
      Store.save();
    };
    item.appendChild(del);
    // Πάτημα: ανοίγει τη συνταγή αν είναι ελληνική
    const local = RECIPES.find(r => keyOf(r) === h.key);
    item.onclick = () => local ? openRecipe(local) : openRecipe({ key: h.key, name: h.name, online: true });
    list.appendChild(item);
  });
}

// ===================== ΞΕΚΙΝΗΜΑ =====================

function renderHeader() {
  const h = new Date().getHours();
  const hello = h < 12 ? "Καλημέρα" : h < 17 ? "Καλό μεσημέρι" : "Καλησπέρα";
  $("greet").textContent = `${hello}, ${CONFIG.me.voc} & ${CONFIG.her.voc}! 👋`;
  $("syncChip").textContent = Store.mode === "cloud" ? "☁️ Κοινό για τους δυο σας" : "📱 Μόνο σε αυτό το κινητό";
  $("logoutBtn").classList.toggle("hidden", Store.mode !== "cloud");
}

// Ό,τι αλλάζει στα δεδομένα (από εμάς ή από το άλλο κινητό) ξαναζωγραφίζεται
function renderEverything() {
  renderFilterButtons();
  renderWeek();
  renderShop();
  renderAll();
  renderHistory();
}

function showSurpriseOnce() {
  const s = CONFIG.surprise;
  let seen = false;
  try { seen = localStorage.getItem("surprise-seen") === "1"; } catch {}
  if (!s.show || seen) return;
  $("surpriseTitle").textContent = s.title;
  $("surpriseText").textContent = s.text;
  $("surpriseSig").textContent = s.signature;
  $("surpriseBtn").textContent = s.button;
  $("surprise").classList.remove("hidden");
  $("surpriseBtn").onclick = () => {
    $("surprise").classList.add("hidden");
    try { localStorage.setItem("surprise-seen", "1"); } catch {}
  };
}

function setupUi() {
  $("tagline").textContent = pick(TAGLINES);

  // Κάτω μπάρα
  document.querySelectorAll(".tab").forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll(".tab, .panel").forEach(el => el.classList.remove("active"));
      btn.classList.add("active");
      $(btn.dataset.tab).classList.add("active");
      window.scrollTo({ top: 0 });
    };
  });
  // Όλες / Τι φάγαμε
  document.querySelectorAll(".segbtn").forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll(".segbtn").forEach(b => b.classList.toggle("active", b === btn));
      $("segAll").classList.toggle("hidden", btn.dataset.seg !== "all");
      $("segHist").classList.toggle("hidden", btn.dataset.seg !== "hist");
    };
  });

  [...new Set(RECIPES.map(r => r.cat))].sort((a, b) => a.localeCompare(b, "el"))
    .forEach(c => $("catFilter").add(new Option(c, c)));

  ["κοτόπουλο", "κιμάς", "αυγά", "πατάτες", "ντομάτες", "ρύζι", "μακαρόνια", "φέτα", "κολοκυθάκια", "σπανάκι", "λεμόνι", "ρεβίθια"]
    .forEach(name => {
      const b = document.createElement("button");
      b.textContent = "+ " + name;
      b.onclick = () => addIngredient(name);
      $("quickIngs").appendChild(b);
    });

  const ingInput = $("ingInput");
  ingInput.addEventListener("keydown", e => { if (e.key === "Enter") { addIngredient(ingInput.value); ingInput.value = ""; } });
  $("ingAdd").onclick = () => { addIngredient(ingInput.value); ingInput.value = ""; };

  $("suggestBtn").onclick = suggest;
  $("whoCooks").onclick = whoCooks;
  $("pantryBtn").onclick = findByPantry;
  $("fillWeek").onclick = fillWeek;
  $("clearWeek").onclick = () => { Store.state.plan = [null, null, null, null, null, null, null]; Store.state.shopChecked = []; Store.save(); toast("🧹 Καθαρό μενού. Καινούργια εβδομάδα!"); };
  $("copyShop").onclick = copyShop;
  $("resetShop").onclick = () => { Store.state.shopChecked = []; Store.save(); };
  $("searchInput").oninput = renderAll;
  $("closeSheet").onclick = () => $("sheet").close();
  $("sheet").addEventListener("click", e => { if (e.target === $("sheet")) $("sheet").close(); });   // κλικ έξω = κλείσιμο
  $("loginBtn").onclick = () => Store.login();
  $("logoutBtn").onclick = () => Store.logout();
}

setupUi();
Store.onChange(renderEverything);
Store.init({
  onReady() {
    $("login").classList.add("hidden");
    renderHeader();
    renderEverything();
    showSurpriseOnce();
  },
  onNeedLogin() {
    $("loginText").textContent = "Συνδεθείτε για να βλέπετε κοινό μενού και ιστορικό.";
    $("loginBtn").textContent = "Σύνδεση με Google";
    $("loginBtn").onclick = () => Store.login();
    $("login").classList.remove("hidden");
  },
  onDenied() {
    $("loginText").textContent = "Αυτή η κουζίνα είναι ιδιωτική 🔒. Μόνο για δύο άτομα!";
    $("loginBtn").textContent = "Δοκίμασε άλλο λογαριασμό";
    $("loginBtn").onclick = () => Store.logout();
    $("login").classList.remove("hidden");
  },
});
