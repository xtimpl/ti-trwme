// =====================================================================
// store.js — Πού αποθηκεύονται τα δεδομένα σας.
//
// Δύο τρόποι:
//   • "cloud": Firebase (Google login). Τα βλέπετε και οι δύο, σε πραγματικό χρόνο.
//   • "local": μόνο στο συγκεκριμένο κινητό (localStorage). Χρησιμοποιείται
//              αν δεν έχεις βάλει ρυθμίσεις Firebase στο config.js.
//
// Όλα τα δεδομένα είναι ένα αντικείμενο (Store.state) που σώζεται ολόκληρο:
//   history     : τι μαγειρέψατε  [{ key, name, date }]
//   plan        : 7 θέσεις (Δευτέρα..Κυριακή) με συνταγές ή null
//   filters     : ποια φίλτρα ατόμων είναι ανοιχτά  { christos: true, nikoleta: false }
//   shopChecked : ποια είδη της λίστας ψωνίων έχετε ήδη πάρει
// =====================================================================

const Store = {
  mode: "local",
  user: null,
  docRef: null,
  state: { history: [], plan: [null, null, null, null, null, null, null], filters: {}, shopChecked: [] },
  listeners: [],

  // Όποιος θέλει να μαθαίνει για αλλαγές (π.χ. το άλλο κινητό άλλαξε κάτι)
  onChange(fn) { this.listeners.push(fn); },
  emit() { this.listeners.forEach(fn => fn()); },

  loadLocal() {
    try { Object.assign(this.state, JSON.parse(localStorage.getItem("food-state")) || {}); } catch {}
    // Μεταφορά από την παλιά έκδοση του site (είχε μόνο ιστορικό)
    try {
      const old = JSON.parse(localStorage.getItem("food-history"));
      if (old && !this.state.history.length) this.state.history = old;
    } catch {}
  },

  // Σώζει τα πάντα (στο cloud ή στο κινητό) και ενημερώνει την οθόνη
  save() {
    try { localStorage.setItem("food-state", JSON.stringify(this.state)); } catch {}
    if (this.mode === "cloud" && this.docRef) {
      this.docRef.set(JSON.parse(JSON.stringify(this.state)))
        .catch(() => toast("Δεν σώθηκε στο cloud. Έχεις ίντερνετ; 📶"));
    }
    this.emit();
  },

  // Ξεκίνημα. Καλεί onReady όταν τα δεδομένα είναι έτοιμα,
  // onNeedLogin αν χρειάζεται σύνδεση, onDenied αν ο λογαριασμός δεν επιτρέπεται.
  init({ onReady, onNeedLogin, onDenied }) {
    this.loadLocal();
    const cfg = CONFIG.firebase;
    if (!cfg.apiKey || typeof firebase === "undefined") { this.mode = "local"; onReady(); return; }

    this.mode = "cloud";
    firebase.initializeApp(cfg);
    const auth = firebase.auth();
    auth.getRedirectResult().catch(() => {});

    auth.onAuthStateChanged(user => {
      this.user = user;
      if (this.unsub) this.unsub();
      if (!user) { onNeedLogin(); return; }

      // Ένα κοινό "έγγραφο" για το σπίτι σας: homes/main
      this.docRef = firebase.firestore().collection("homes").doc("main");
      let first = true;
      this.unsub = this.docRef.onSnapshot(snap => {
        if (!snap.exists) {
          this.docRef.set(JSON.parse(JSON.stringify(this.state)));  // πρώτη φορά: ανεβάζει ό,τι υπάρχει στο κινητό
        } else {
          Object.assign(this.state, snap.data());
        }
        if (first) { first = false; onReady(); } else this.emit();
      }, err => onDenied(err));
    });
  },

  login() {
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider)
      .catch(() => firebase.auth().signInWithRedirect(provider));  // αν το κινητό μπλοκάρει το popup
  },
  logout() { firebase.auth().signOut(); },
};
