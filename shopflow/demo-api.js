/**
 * ShopFlow — Mock API Centralisé v1.0
 * Conforme à l'OpenAPI spec : docs/openapi.json
 *
 * Contient : mockData, demoApi, testApi
 *
 * Usage :
 *   <script src="../../demo-api.js"></script>
 *   const data = await demoApi.getProducts();
 */

const delay = (ms = 80) => new Promise(r => setTimeout(r, ms));

const mockData = {
  users: [
    { id: 1, name: 'Alex', email: 'alex@shopflow.dev', password: 'pass', avatar: '', role: 'super_admin', walletBalance: 50000, dailyBonusDate: null, createdAt: '2025-01-01T00:00:00Z' },
    { id: 2, name: 'Julie', email: 'julie@shopflow.dev', password: 'pass', avatar: '', role: 'admin', walletBalance: 25000, dailyBonusDate: null, createdAt: '2025-02-01T00:00:00Z' },
    { id: 3, name: 'Marc', email: 'marc@shopflow.dev', password: 'pass', avatar: '', role: 'user', walletBalance: 10000, dailyBonusDate: null, createdAt: '2025-03-01T00:00:00Z' },
    { id: 4, name: 'Sophie', email: 'sophie@shopflow.dev', password: 'pass', avatar: '', role: 'user', walletBalance: 15000, dailyBonusDate: '2026-07-23', createdAt: '2025-03-15T00:00:00Z' },
    { id: 5, name: 'Lucas', email: 'lucas@shopflow.dev', password: 'pass', avatar: '', role: 'user', walletBalance: 8500, dailyBonusDate: null, createdAt: '2025-04-01T00:00:00Z' },
    { id: 6, name: 'Emma', email: 'emma@shopflow.dev', password: 'pass', avatar: '', role: 'user', walletBalance: 20000, dailyBonusDate: null, createdAt: '2025-04-15T00:00:00Z' },
  ],
  categories: [
    { id: 1, name: 'Électronique', slug: 'electronique' },
    { id: 2, name: 'Mode', slug: 'mode' },
    { id: 3, name: 'Maison', slug: 'maison' },
    { id: 4, name: 'Sport', slug: 'sport' },
    { id: 5, name: 'Livres', slug: 'livres' },
    { id: 6, name: 'Jeux', slug: 'jeux' },
  ],
  products: [
    { id: 1, title: 'Casque Bluetooth Pro', description: 'Casque sans fil avec réduction de bruit active, 30h d\'autonomie.', price: 89.99, stock: 25, stockStatus: 'in_stock', availabilityDate: null, categoryId: 1, sellerId: 2, createdAt: '2025-03-01T10:00:00Z' },
    { id: 2, title: 'Montre Connectée X200', description: 'GPS, cardio, 5 ATM, autonomie 14 jours.', price: 199.99, stock: 3, stockStatus: 'low_stock', availabilityDate: null, categoryId: 1, sellerId: 2, createdAt: '2025-03-05T10:00:00Z' },
    { id: 3, title: 'T-Shirt Coton Bio', description: 'T-shirt en coton biologique, coupe regular.', price: 29.99, stock: 0, stockStatus: 'out_of_stock', availabilityDate: '2026-08-15', categoryId: 2, sellerId: 3, createdAt: '2025-03-10T10:00:00Z' },
    { id: 4, title: 'Lampe Connectée RGB', description: 'Lampe WiFi RGB, compatible Alexa et Google Home.', price: 49.99, stock: 0, stockStatus: 'pre_order', availabilityDate: '2026-09-01', categoryId: 3, sellerId: 3, createdAt: '2025-03-15T10:00:00Z' },
    { id: 5, title: 'Sac à Dos Urbain 25L', description: 'Imperméable, compartiment PC 15 pouces.', price: 69.99, stock: 15, stockStatus: 'in_stock', availabilityDate: null, categoryId: 2, sellerId: 1, createdAt: '2025-03-20T10:00:00Z' },
    { id: 6, title: 'Ballon de Foot Pro', description: 'Taille 5, FIFA Quality Pro, couture machine.', price: 39.99, stock: 8, stockStatus: 'in_stock', availabilityDate: null, categoryId: 4, sellerId: 1, createdAt: '2025-03-25T10:00:00Z' },
    { id: 7, title: 'Roman Science-Fiction', description: 'Prix Hugo 2024, édition collector reliée.', price: 24.99, stock: 2, stockStatus: 'low_stock', availabilityDate: null, categoryId: 5, sellerId: 4, createdAt: '2025-04-01T10:00:00Z' },
    { id: 8, title: 'Jeu de Société Duel', description: 'Jeu stratégique 2 joueurs, parties de 30 minutes.', price: 34.99, stock: 0, stockStatus: 'out_of_stock', availabilityDate: '2026-07-30', categoryId: 6, sellerId: 4, createdAt: '2025-04-05T10:00:00Z' },
    { id: 9, title: 'Enceinte Portable', description: 'Enceinte Bluetooth IPX7, 20h d\'autonomie.', price: 59.99, stock: 12, stockStatus: 'in_stock', availabilityDate: null, categoryId: 1, sellerId: 5, createdAt: '2025-04-10T10:00:00Z' },
    { id: 10, title: 'Veste Imperméable', description: 'Veste technique respirante, déperlante.', price: 119.99, stock: 6, stockStatus: 'in_stock', availabilityDate: null, categoryId: 2, sellerId: 5, createdAt: '2025-04-12T10:00:00Z' },
    { id: 11, title: 'Cafetière Expresso', description: 'Machine à café automatique 15 bars.', price: 249.99, stock: 4, stockStatus: 'low_stock', availabilityDate: null, categoryId: 3, sellerId: 6, createdAt: '2025-04-15T10:00:00Z' },
    { id: 12, title: 'Tapis de Yoga', description: 'Tapis antidérapant 6mm, kit transport inclus.', price: 34.99, stock: 20, stockStatus: 'in_stock', availabilityDate: null, categoryId: 4, sellerId: 6, createdAt: '2025-04-18T10:00:00Z' },
    { id: 13, title: 'Bande Dessinée', description: 'Tome 1 de la série à succès.', price: 14.99, stock: 0, stockStatus: 'pre_order', availabilityDate: '2026-10-01', categoryId: 5, sellerId: 2, createdAt: '2025-04-20T10:00:00Z' },
    { id: 14, title: 'Console Rétro', description: 'Console mini préchargée avec 500 jeux.', price: 79.99, stock: 30, stockStatus: 'in_stock', availabilityDate: null, categoryId: 6, sellerId: 2, createdAt: '2025-04-22T10:00:00Z' },
  ],
  reviews: [
    { id: 1, productId: 1, userId: 3, rating: 5, comment: 'Super casque, le son est incroyable !', createdAt: '2025-04-10T10:00:00Z' },
    { id: 2, productId: 1, userId: 4, rating: 4, comment: 'Très bon rapport qualité-prix.', createdAt: '2025-04-12T10:00:00Z' },
    { id: 3, productId: 5, userId: 2, rating: 5, comment: 'Sac super pratique pour le quotidien.', createdAt: '2025-04-15T10:00:00Z' },
    { id: 4, productId: 9, userId: 1, rating: 4, comment: 'Bon son, bonne autonomie.', createdAt: '2025-04-20T10:00:00Z' },
    { id: 5, productId: 10, userId: 3, rating: 5, comment: 'Veste chaude et imperméable, parfaite.', createdAt: '2025-04-25T10:00:00Z' },
    { id: 6, productId: 12, userId: 4, rating: 4, comment: 'Bon tapis, confortable.', createdAt: '2025-05-01T10:00:00Z' },
  ],
  orders: [
    { id: 1, buyerId: 3, items: [{ productId: 1, qty: 1, price: 89.99 }], total: 89.99, status: 'delivered', createdAt: '2025-04-20T10:00:00Z' },
    { id: 2, buyerId: 4, items: [{ productId: 5, qty: 1, price: 69.99 }], total: 69.99, status: 'paid', createdAt: '2025-05-01T10:00:00Z' },
    { id: 3, buyerId: 3, items: [{ productId: 9, qty: 1, price: 59.99 }], total: 59.99, status: 'pending', createdAt: '2025-05-10T10:00:00Z' },
  ],
  transactions: [
    { id: 1, userId: 3, amount: -89.99, type: 'purchase', description: 'Achat Casque Bluetooth Pro', createdAt: '2025-04-20T10:00:00Z' },
    { id: 2, userId: 2, amount: 89.99, type: 'sale', description: 'Vente Casque Bluetooth Pro', createdAt: '2025-04-20T10:00:00Z' },
    { id: 3, userId: 4, amount: 500, type: 'bonus', description: 'Bonus quotidien', createdAt: '2025-05-01T10:00:00Z' },
    { id: 4, userId: 4, amount: -69.99, type: 'purchase', description: 'Achat Sac à Dos Urbain', createdAt: '2025-05-01T10:00:00Z' },
    { id: 5, userId: 1, amount: 69.99, type: 'sale', description: 'Vente Sac à Dos Urbain', createdAt: '2025-05-01T10:00:00Z' },
    { id: 6, userId: 3, amount: 10000, type: 'credit', description: 'Crédit initial', createdAt: '2025-03-01T10:00:00Z' },
    { id: 7, userId: 4, amount: 15000, type: 'credit', description: 'Crédit initial', createdAt: '2025-03-15T10:00:00Z' },
  ],
  favorites: [
    { id: 1, userId: 3, productId: 1 },
    { id: 2, userId: 3, productId: 5 },
    { id: 3, userId: 4, productId: 10 },
  ],
};

let _currentUser = null;
let _cartItems = [];

function getCurrentUser() { return _currentUser; }
function setCurrentUser(u) { _currentUser = u; }
function getCartItems() { return _cartItems; }
function resetMockData() { _currentUser = null; _cartItems = []; }

function _auth() { if (!_currentUser) throw new Error('Connectez-vous.'); }
function _admin() { _auth(); if (_currentUser.role === 'user') throw new Error('Accès refusé.'); }

const demoApi = {
  // === AUTH ===
  async register(data) { await delay(); if (mockData.users.find(u => u.email === data.email)) throw new Error('Email déjà utilisé.'); const u = { id: mockData.users.length + 1, name: data.name, email: data.email, password: data.password, avatar: '', role: 'user', walletBalance: 10000, dailyBonusDate: null, createdAt: new Date().toISOString() }; mockData.users.push(u); _currentUser = u; mockData.transactions.push({ id: mockData.transactions.length + 1, userId: u.id, amount: 10000, type: 'credit', description: 'Crédit de bienvenue', createdAt: new Date().toISOString() }); return { user: { ...u, password: undefined }, token: 't' + u.id }; },
  async login(data) { await delay(); const u = mockData.users.find(x => x.email === data.email && x.password === data.password); if (!u) throw new Error('Email ou mot de passe incorrect.'); _currentUser = u; return { user: { ...u, password: undefined }, token: 't' + u.id }; },
  async logout() { await delay(50); _currentUser = null; return { ok: true }; },

  // === USERS ===
  async getMe() { await delay(50); _auth(); return { ..._currentUser, password: undefined }; },
  async updateMe(d) { await delay(); _auth(); Object.assign(_currentUser, d); return { ..._currentUser, password: undefined }; },

  // === PRODUCTS ===
  async getProducts(f = {}) { await delay(80); let p = [...mockData.products]; if (f.categoryId) p = p.filter(x => Array.isArray(f.categoryId) ? f.categoryId.includes(x.categoryId) : x.categoryId === f.categoryId); if (f.minPrice) p = p.filter(x => x.price >= f.minPrice); if (f.maxPrice) p = p.filter(x => x.price <= f.maxPrice); if (f.stockStatus) p = p.filter(x => Array.isArray(f.stockStatus) ? f.stockStatus.includes(x.stockStatus) : x.stockStatus === f.stockStatus); if (f.search) { const q = f.search.toLowerCase(); p = p.filter(x => x.title.toLowerCase().includes(q) || x.description.toLowerCase().includes(q)); } return p.map(x => ({ ...x, seller: mockData.users.find(u => u.id === x.sellerId) ? { ...mockData.users.find(u => u.id === x.sellerId), password: undefined } : null })); },
  async getProduct(id) { await delay(50); const p = mockData.products.find(x => x.id === id); if (!p) throw new Error('Produit introuvable.'); return { ...p, seller: mockData.users.find(u => u.id === p.sellerId) ? { ...mockData.users.find(u => u.id === p.sellerId), password: undefined } : null, reviews: mockData.reviews.filter(r => r.productId === id).map(r => ({ ...r, author: mockData.users.find(u => u.id === r.userId) ? { ...mockData.users.find(u => u.id === r.userId), password: undefined } : null })) }; },
  async createProduct(d) { await delay(); _auth(); const p = { id: mockData.products.length + 1, ...d, sellerId: _currentUser.id, createdAt: new Date().toISOString() }; mockData.products.push(p); return p; },
  async updateProduct(id, d) { await delay(); const p = mockData.products.find(x => x.id === id); if (!p) throw new Error('Produit introuvable.'); Object.assign(p, d); return p; },
  async deleteProduct(id) { await delay(); mockData.products = mockData.products.filter(x => x.id !== id); return { ok: true }; },

  // === CATEGORIES ===
  async getCategories() { await delay(30); return mockData.categories; },
  async createCategory(d) { await delay(); _admin(); const c = { id: mockData.categories.length + 1, name: d.name, slug: d.name.toLowerCase().replace(/\s+/g, '-') }; mockData.categories.push(c); return c; },
  async updateCategory(id, d) { await delay(); _admin(); const c = mockData.categories.find(x => x.id === id); if (!c) throw new Error('Catégorie introuvable.'); Object.assign(c, d); c.slug = c.name.toLowerCase().replace(/\s+/g, '-'); return c; },
  async deleteCategory(id) { await delay(); _admin(); mockData.categories = mockData.categories.filter(x => x.id !== id); return { ok: true }; },

  // === CART ===
  async getCart() { await delay(50); return _cartItems.map(c => { const p = mockData.products.find(x => x.id === c.productId); return { ...c, product: p || null }; }); },
  async addToCart(pid, q = 1) { await delay(50); _auth(); const p = mockData.products.find(x => x.id === pid); if (!p) throw new Error('Produit introuvable.'); if (p.stock === 0 && p.stockStatus !== 'pre_order') throw new Error('Rupture de stock.'); const e = _cartItems.find(c => c.productId === pid); if (e) e.qty += q; else _cartItems.push({ id: _cartItems.length + 1, productId: pid, qty: q }); return { ok: true }; },
  async updateCartItem(iid, q) { await delay(50); const i = _cartItems.find(c => c.id === iid); if (i) i.qty = q; return { ok: true }; },
  async removeFromCart(iid) { await delay(50); _cartItems = _cartItems.filter(c => c.id !== iid); return { ok: true }; },

  // === ORDERS ===
  async createOrder() { await delay(200); _auth(); if (!_cartItems.length) throw new Error('Panier vide.'); let total = 0; for (const c of _cartItems) { const p = mockData.products.find(x => x.id === c.productId); if (!p || (p.stock === 0 && p.stockStatus !== 'pre_order')) throw new Error((p?.title || 'Produit') + ' indisponible.'); total += p.price * c.qty; if (_currentUser.walletBalance < total) throw new Error('Solde insuffisant.'); } for (const c of _cartItems) { const p = mockData.products.find(x => x.id === c.productId); if (p) p.stock -= c.qty; } _currentUser.walletBalance -= total; const o = { id: mockData.orders.length + 1, buyerId: _currentUser.id, items: _cartItems.map(c => ({ productId: c.productId, qty: c.qty, price: mockData.products.find(p => p.id === c.productId)?.price })), total, status: 'paid', createdAt: new Date().toISOString() }; mockData.orders.push(o); mockData.transactions.push({ id: mockData.transactions.length + 1, userId: _currentUser.id, amount: -total, type: 'purchase', description: 'Commande #' + o.id, createdAt: new Date().toISOString() }); _cartItems = []; return o; },
  async getOrders() { await delay(50); _auth(); return mockData.orders.filter(o => o.buyerId === _currentUser.id).map(o => ({ ...o, items: o.items.map(i => ({ ...i, product: mockData.products.find(p => p.id === i.productId) })) })); },
  async getOrder(id) { await delay(50); const o = mockData.orders.find(x => x.id === id); if (!o) throw new Error('Commande introuvable.'); return { ...o, items: o.items.map(i => ({ ...i, product: mockData.products.find(p => p.id === i.productId) })) }; },
  async updateOrderStatus(id, status) { await delay(); const o = mockData.orders.find(x => x.id === id); if (!o) throw new Error('Commande introuvable.'); o.status = status; return o; },

  // === REVIEWS ===
  async getReviews(pid) { await delay(50); return mockData.reviews.filter(r => r.productId === pid).map(r => ({ ...r, author: mockData.users.find(u => u.id === r.userId) ? { ...mockData.users.find(u => u.id === r.userId), password: undefined } : null })); },
  async createReview(pid, d) { await delay(); _auth(); const r = { id: mockData.reviews.length + 1, productId: pid, userId: _currentUser.id, rating: d.rating, comment: d.comment || '', createdAt: new Date().toISOString() }; mockData.reviews.push(r); return { ...r, author: { ..._currentUser, password: undefined } }; },
  async deleteReview(id) { await delay(); mockData.reviews = mockData.reviews.filter(r => r.id !== id); return { ok: true }; },

  // === FAVORITES ===
  async getFavorites() { await delay(50); _auth(); return mockData.favorites.filter(f => f.userId === _currentUser.id).map(f => ({ ...f, product: mockData.products.find(p => p.id === f.productId) })); },
  async addFavorite(pid) { await delay(); _auth(); if (!mockData.favorites.find(f => f.userId === _currentUser.id && f.productId === pid)) mockData.favorites.push({ id: mockData.favorites.length + 1, userId: _currentUser.id, productId: pid }); return { ok: true }; },
  async removeFavorite(pid) { await delay(); _auth(); mockData.favorites = mockData.favorites.filter(f => !(f.userId === _currentUser.id && f.productId === pid)); return { ok: true }; },

  // === WALLET ===
  async getWallet() { await delay(50); _auth(); return { balance: _currentUser.walletBalance, transactions: mockData.transactions.filter(t => t.userId === _currentUser.id).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) }; },
  async claimDailyBonus() { await delay(); _auth(); const today = new Date().toISOString().split('T')[0]; if (_currentUser.dailyBonusDate === today) throw new Error('Bonus déjà réclamé aujourd\'hui.'); _currentUser.dailyBonusDate = today; _currentUser.walletBalance += 500; mockData.transactions.push({ id: mockData.transactions.length + 1, userId: _currentUser.id, amount: 500, type: 'bonus', description: 'Bonus quotidien', createdAt: new Date().toISOString() }); return { balance: _currentUser.walletBalance, bonus: 500 }; },
  async creditUser(uid, amount, reason) { await delay(); _admin(); const u = mockData.users.find(x => x.id === uid); if (!u) throw new Error('Utilisateur introuvable.'); u.walletBalance += amount; mockData.transactions.push({ id: mockData.transactions.length + 1, userId: uid, amount, type: 'credit', description: reason || 'Crédit administrateur', createdAt: new Date().toISOString() }); return { balance: u.walletBalance }; },

  // === ADMIN ===
  async getUsers() { await delay(80); _admin(); return mockData.users.map(u => ({ ...u, password: undefined })); },
  async updateUserRole(uid, role) { await delay(); _admin(); const u = mockData.users.find(x => x.id === uid); if (!u) throw new Error('Utilisateur introuvable.'); if (u.role === 'super_admin') throw new Error('Impossible de modifier le super admin.'); u.role = role; return { ok: true }; },
  async inviteAdmin(email) { await delay(); _admin(); mockData.users.push({ id: mockData.users.length + 1, name: email.split('@')[0], email, password: 'changeme', avatar: '', role: 'admin', walletBalance: 0, dailyBonusDate: null, createdAt: new Date().toISOString() }); return { ok: true }; },
};

// === TESTS ===
async function testApi() {
  const results = [];
  const ok = (name) => { results.push({ name, passed: true }); console.log('  ✅', name); };
  const fail = (name, err) => { results.push({ name, passed: false, error: err }); console.log('  ❌', name, '-', err); };
  console.group('🧪 ShopFlow — Tests API');

  try { const r = await demoApi.register({ name: 'Test', email: 'test@sf.dev', password: 'pass' }); if (r.token) ok('register'); else fail('register'); } catch (e) { fail('register', e.message); }
  try { await demoApi.register({ name: 'T', email: 'test@sf.dev', password: 'pass' }); fail('register duplicate', 'Aurait dû échouer'); } catch (e) { ok('register duplicate'); }
  setCurrentUser(null);
  try { const r = await demoApi.login({ email: 'test@sf.dev', password: 'pass' }); if (r.token) ok('login'); else fail('login'); } catch (e) { fail('login', e.message); }
  try { await demoApi.login({ email: 'test@sf.dev', password: 'wrong' }); fail('login wrong password'); } catch (e) { ok('login wrong password'); }
  try { const me = await demoApi.getMe(); if (me.email === 'test@sf.dev') ok('getMe'); else fail('getMe'); } catch (e) { fail('getMe', e.message); }
  try { const p = await demoApi.getProducts(); if (p.length > 0) ok('getProducts'); else fail('getProducts'); } catch (e) { fail('getProducts', e.message); }
  try { const p = await demoApi.getProducts({ minPrice: 50, maxPrice: 100 }); if (p.every(x => x.price >= 50 && x.price <= 100)) ok('getProducts price filter'); else fail('getProducts price filter'); } catch (e) { fail('getProducts price filter', e.message); }
  try { const p = await demoApi.getProducts({ stockStatus: 'out_of_stock' }); if (p.every(x => x.stockStatus === 'out_of_stock')) ok('getProducts stock filter'); else fail('getProducts stock filter'); } catch (e) { fail('getProducts stock filter', e.message); }
  try { const p = await demoApi.getProduct(1); if (p.title) ok('getProduct'); else fail('getProduct'); } catch (e) { fail('getProduct', e.message); }
  try { const c = await demoApi.getCategories(); if (c.length === 6) ok('getCategories'); else fail('getCategories'); } catch (e) { fail('getCategories', e.message); }
  try { await demoApi.addToCart(1); const cart = await demoApi.getCart(); if (cart.length > 0) ok('addToCart + getCart'); else fail('addToCart'); } catch (e) { fail('addToCart', e.message); }
  try { const o = await demoApi.createOrder(); if (o.id) ok('createOrder'); else fail('createOrder'); } catch (e) { fail('createOrder', e.message); }
  try { const orders = await demoApi.getOrders(); if (orders.find(o => o.id)) ok('getOrders'); else fail('getOrders'); } catch (e) { fail('getOrders', e.message); }
  try { const r = await demoApi.createReview(1, { rating: 5, comment: 'Test' }); if (r.rating === 5) ok('createReview'); else fail('createReview'); } catch (e) { fail('createReview', e.message); }
  try { await demoApi.addFavorite(2); const favs = await demoApi.getFavorites(); if (favs.find(f => f.productId === 2)) ok('addFavorite + getFavorites'); else fail('addFavorite'); } catch (e) { fail('addFavorite', e.message); }
  try { const w = await demoApi.getWallet(); if (w.balance >= 0) ok('getWallet'); else fail('getWallet'); } catch (e) { fail('getWallet', e.message); }
  try { const r = await demoApi.claimDailyBonus(); if (r.bonus === 500) ok('claimDailyBonus'); else fail('claimDailyBonus'); } catch (e) { fail('claimDailyBonus', e.message); }
  try { await demoApi.claimDailyBonus(); fail('claimDailyBonus duplicate'); } catch (e) { ok('claimDailyBonus duplicate guard'); }
  try { const users = await demoApi.getUsers(); if (users.length > 0) ok('getUsers (admin)'); else fail('getUsers'); } catch (e) { fail('getUsers', e.message); }
  try { await demoApi.updateUserRole(3, 'admin'); const users = await demoApi.getUsers(); if (users.find(u => u.id === 3 && u.role === 'admin')) ok('updateUserRole'); else fail('updateUserRole'); } catch (e) { fail('updateUserRole', e.message); }
  try { await demoApi.updateUserRole(1, 'user'); fail('updateUserRole super_admin'); } catch (e) { ok('updateUserRole super_admin guard'); }

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  console.log(`\n📊 Résultat: ${passed} ✅ / ${failed} ❌ / ${results.length} total`);
  console.groupEnd();
  return { total: results.length, passed, failed, results };
}

// Auto-login default user
setCurrentUser(mockData.users[0]);
