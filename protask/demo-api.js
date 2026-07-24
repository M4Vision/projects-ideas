/**
 * ProTask — Mock API Centralisé v1.0
 * Conforme à l'OpenAPI spec : docs/openapi.json
 *
 * Contient :
 * - mockData  : Données de démonstration
 * - demoApi   : Fonctions API simulant les endpoints
 * - testApi   : Tests unitaires de validation
 *
 * Usage dans les templates :
 *   <script src="../../demo-api.js"></script>
 *   const api = demoApi;
 *   const data = await api.getBoards();
 */

const delay = (ms = 80) => new Promise(r => setTimeout(r, ms));

const mockData = {
  users: [
    { id: 1, name: 'Alexandre', email: 'alex@protask.dev', avatar: '', password: 'pass123', createdAt: '2025-01-15T08:00:00Z' },
    { id: 2, name: 'Sophie', email: 'sophie@protask.dev', avatar: '', password: 'pass123', createdAt: '2025-02-20T10:30:00Z' },
    { id: 3, name: 'Marc', email: 'marc@protask.dev', avatar: '', password: 'pass123', createdAt: '2025-03-10T14:00:00Z' },
  ],
  boards: [
    { id: 1, title: 'Design System', ownerId: 1, createdAt: '2025-03-01T09:00:00Z' },
    { id: 2, title: 'Refonte App Mobile', ownerId: 1, createdAt: '2025-03-10T14:00:00Z' },
    { id: 3, title: 'Marketing Q2', ownerId: 2, createdAt: '2025-04-01T11:00:00Z' },
  ],
  columns: [
    { id: 1, title: 'Backlog', order: 0, boardId: 1 },
    { id: 2, title: 'En cours', order: 1, boardId: 1 },
    { id: 3, title: 'Terminé', order: 2, boardId: 1 },
    { id: 4, title: 'À faire', order: 0, boardId: 2 },
    { id: 5, title: 'En cours', order: 1, boardId: 2 },
    { id: 6, title: 'Terminé', order: 2, boardId: 2 },
    { id: 7, title: 'Idées', order: 0, boardId: 3 },
    { id: 8, title: 'En production', order: 1, boardId: 3 },
  ],
  cards: [
    { id: 1, title: 'Définir la palette', description: 'Choisir les couleurs primaires et secondaires du design system.', order: 0, columnId: 1, dueDate: '2025-04-15', assigneeId: 1, labels: [1] },
    { id: 2, title: 'Composants UI', description: 'Créer les composations Button, Input, Card, Modal.', order: 1, columnId: 1, dueDate: '2025-04-20', assigneeId: 2, labels: [1, 2] },
    { id: 3, title: 'Page accueil responsive', description: 'Terminer la mise en page responsive de la page d\'accueil.', order: 0, columnId: 2, dueDate: '2025-04-10', assigneeId: 1, labels: [2] },
    { id: 4, title: 'Documentation', description: 'Écrire la documentation du design system.', order: 1, columnId: 3, dueDate: '2025-04-05', assigneeId: 2, labels: [3] },
    { id: 5, title: 'Wireframes', description: 'Wireframes validés par le client.', order: 0, columnId: 4, dueDate: '2025-04-08', assigneeId: 1, labels: [2] },
    { id: 6, title: 'Maquette Figma', description: 'Maquette haute fidélité de l\'écran principal.', order: 0, columnId: 5, dueDate: '2025-04-18', assigneeId: 1, labels: [1] },
    { id: 7, title: 'Tests utilisateurs', description: 'Sessions de test avec 5 utilisateurs.', order: 0, columnId: 6, dueDate: '2025-04-12', assigneeId: 2, labels: [3] },
    { id: 8, title: 'Analyse concurrents', description: 'Benchmark des 3 principaux concurrents.', order: 0, columnId: 7, dueDate: '2025-04-14', assigneeId: 1, labels: [2] },
    { id: 9, title: 'Stratégie contenu', description: 'Définir le calendrier éditorial Q2.', order: 1, columnId: 7, dueDate: '2025-04-22', assigneeId: 2, labels: [1, 4] },
    { id: 10, title: 'Campagne emailing', description: 'Préparer la séquence d\'emails pour le lancement.', order: 0, columnId: 8, dueDate: '2025-04-25', assigneeId: 1, labels: [4] },
  ],
  labels: [
    { id: 1, name: 'Design', color: '#8B5CF6', boardId: 1 },
    { id: 2, name: 'Dev', color: '#3B82F6', boardId: 1 },
    { id: 3, name: 'Documentation', color: '#10B981', boardId: 1 },
    { id: 4, name: 'Urgent', color: '#EF4444', boardId: 1 },
  ],
  comments: [
    { id: 1, text: 'J\'ai commencé la palette, je propose du violet comme couleur principale.', authorId: 1, cardId: 1, createdAt: '2025-04-01T10:00:00Z' },
    { id: 2, text: 'Bonne idée ! Je valide le violet.', authorId: 2, cardId: 1, createdAt: '2025-04-01T11:30:00Z' },
    { id: 3, text: 'PR créé sur GitHub.', authorId: 1, cardId: 3, createdAt: '2025-04-02T09:00:00Z' },
    { id: 4, text: 'J\'ai ajouté les variantes disabled et loading.', authorId: 2, cardId: 2, createdAt: '2025-04-02T14:00:00Z' },
    { id: 5, text: 'Review faite, quelques suggestions.', authorId: 1, cardId: 2, createdAt: '2025-04-03T10:00:00Z' },
  ],
  invitations: [
    { id: 1, boardId: 1, email: 'marc@protask.dev', invitedById: 1, status: 'accepted', createdAt: '2025-03-15T08:00:00Z' },
    { id: 2, boardId: 1, email: 'julie@test.com', invitedById: 1, status: 'pending', createdAt: '2025-04-01T08:00:00Z' },
  ],
};

// Board members (many-to-many relationship stored separately for simplicity)
mockData.boardMembers = {
  1: [2, 3],
  2: [],
  3: [1],
};

let _currentUser = null;
let _authToken = null;

function getCurrentUser() { return _currentUser; }
function setCurrentUser(u) { _currentUser = u; _authToken = u ? 'token-' + u.id : null; }
function resetMockData() { _currentUser = null; _authToken = null; }

function _ensureAuth() { if (!_currentUser) throw new Error('Non authentifié. Veuillez vous connecter.'); }
function _findBoard(id) { const b = mockData.boards.find(x => x.id === id); if (!b) throw new Error('Board introuvable.'); return b; }
function _findColumn(id) { const c = mockData.columns.find(x => x.id === id); if (!c) throw new Error('Colonne introuvable.'); return c; }
function _findCard(id) { const c = mockData.cards.find(x => x.id === id); if (!c) throw new Error('Carte introuvable.'); return c; }
function _findUser(id) { return mockData.users.find(x => x.id === id); }

const demoApi = {
  // === AUTH ===
  async register(data) {
    await delay();
    if (mockData.users.find(u => u.email === data.email)) throw new Error('Cet email est déjà utilisé.');
    const user = { id: mockData.users.length + 1, name: data.name, email: data.email, avatar: '', password: data.password, createdAt: new Date().toISOString() };
    mockData.users.push(user);
    setCurrentUser(user);
    return { user: { ...user, password: undefined }, token: 'token-' + user.id };
  },
  async login(data) {
    await delay();
    const user = mockData.users.find(u => u.email === data.email);
    if (!user || user.password !== data.password) throw new Error('Email ou mot de passe incorrect.');
    setCurrentUser(user);
    return { user: { ...user, password: undefined }, token: 'token-' + user.id };
  },
  async logout() { await delay(50); setCurrentUser(null); return { success: true }; },

  // === USERS ===
  async getMe() { await delay(50); _ensureAuth(); return { ..._currentUser, password: undefined }; },
  async updateMe(data) { await delay(); _ensureAuth(); Object.assign(_currentUser, data); return { ..._currentUser, password: undefined }; },

  // === BOARDS ===
  async getBoards() {
    await delay(80);
    _ensureAuth();
    return mockData.boards
      .filter(b => b.ownerId === _currentUser.id || (mockData.boardMembers[b.id] || []).includes(_currentUser.id))
      .map(b => ({
        ...b,
        members: [mockData.users.find(u => u.id === b.ownerId), ...((mockData.boardMembers[b.id] || []).map(id => _findUser(id)))].filter(Boolean).map(m => ({ ...m, password: undefined })),
        cardCount: mockData.cards.filter(c => mockData.columns.filter(col => col.boardId === b.id).some(col => col.id === c.columnId)).length,
      }));
  },
  async createBoard(data) {
    await delay();
    _ensureAuth();
    const board = { id: mockData.boards.length + 1, title: data.title, ownerId: _currentUser.id, createdAt: new Date().toISOString() };
    mockData.boards.push(board);
    mockData.boardMembers[board.id] = [];
    // Create default columns
    ['À faire', 'En cours', 'Terminé'].forEach((title, i) => {
      mockData.columns.push({ id: mockData.columns.length + 1, title, order: i, boardId: board.id });
    });
    return board;
  },
  async getBoard(id) {
    await delay(50);
    const board = _findBoard(id);
    const cols = mockData.columns.filter(c => c.boardId === id).sort((a, b) => a.order - b.order);
    const members = [mockData.users.find(u => u.id === board.ownerId), ...(mockData.boardMembers[id] || []).map(id => _findUser(id))].filter(Boolean);
    return { ...board, columns: cols, members: members.map(m => ({ ...m, password: undefined })) };
  },
  async updateBoard(id, data) { await delay(); const b = _findBoard(id); Object.assign(b, data); return b; },
  async deleteBoard(id) {
    await delay();
    _ensureAuth();
    const b = _findBoard(id);
    if (b.ownerId !== _currentUser.id) throw new Error('Seul le propriétaire peut supprimer ce board.');
    const colIds = mockData.columns.filter(c => c.boardId === id).map(c => c.id);
    mockData.cards = mockData.cards.filter(c => !colIds.includes(c.columnId));
    mockData.columns = mockData.columns.filter(c => c.boardId !== id);
    mockData.boards = mockData.boards.filter(x => x.id !== id);
    return { success: true };
  },

  // === COLUMNS ===
  async getColumns(boardId) { await delay(50); return mockData.columns.filter(c => c.boardId === boardId).sort((a, b) => a.order - b.order); },
  async createColumn(boardId, data) {
    await delay();
    const cols = mockData.columns.filter(c => c.boardId === boardId);
    const col = { id: mockData.columns.length + 1, title: data.title, order: cols.length, boardId };
    mockData.columns.push(col);
    return col;
  },
  async updateColumn(id, data) { await delay(); const c = _findColumn(id); Object.assign(c, data); return c; },
  async deleteColumn(id) {
    await delay();
    mockData.cards = mockData.cards.filter(c => c.columnId !== id);
    mockData.columns = mockData.columns.filter(x => x.id !== id);
    return { success: true };
  },
  async reorderColumns(items) { await delay(); items.forEach(({ id, order }) => { const c = mockData.columns.find(x => x.id === id); if (c) c.order = order; }); return { success: true }; },

  // === CARDS ===
  async getCards(columnId) {
    await delay(50);
    return mockData.cards.filter(c => c.columnId === columnId).sort((a, b) => a.order - b.order).map(c => ({
      ...c,
      assignee: _findUser(c.assigneeId) ? { ..._findUser(c.assigneeId), password: undefined } : null,
      labels: (c.labels || []).map(lId => mockData.labels.find(l => l.id === lId)).filter(Boolean),
    }));
  },
  async createCard(columnId, data) {
    await delay();
    _findColumn(columnId);
    const cards = mockData.cards.filter(c => c.columnId === columnId);
    const card = { id: mockData.cards.length + 1, title: data.title, description: data.description || '', order: cards.length, columnId, dueDate: data.dueDate || null, assigneeId: data.assigneeId || null, labels: data.labels || [] };
    mockData.cards.push(card);
    return card;
  },
  async getCard(id) {
    await delay(50);
    const card = _findCard(id);
    return {
      ...card,
      assignee: _findUser(card.assigneeId) ? { ..._findUser(card.assigneeId), password: undefined } : null,
      labels: (card.labels || []).map(lId => mockData.labels.find(l => l.id === lId)).filter(Boolean),
      comments: mockData.comments.filter(c => c.cardId === id).map(c => ({ ...c, author: _findUser(c.authorId) ? { ..._findUser(c.authorId), password: undefined } : null })).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)),
    };
  },
  async updateCard(id, data) { await delay(); const c = _findCard(id); Object.assign(c, data); return c; },
  async deleteCard(id) { await delay(); mockData.cards = mockData.cards.filter(c => c.id !== id); mockData.comments = mockData.comments.filter(c => c.cardId !== id); return { success: true }; },
  async moveCard(id, columnId, order) { await delay(); const c = _findCard(id); c.columnId = columnId; if (order !== undefined) c.order = order; return c; },

  // === LABELS ===
  async getLabels(boardId) { await delay(50); return mockData.labels.filter(l => l.boardId === boardId); },
  async createLabel(boardId, data) { await delay(); const l = { id: mockData.labels.length + 1, name: data.name, color: data.color || '#3B82F6', boardId }; mockData.labels.push(l); return l; },
  async updateLabel(id, data) { await delay(); const l = mockData.labels.find(x => x.id === id); if (!l) throw new Error('Label introuvable.'); Object.assign(l, data); return l; },
  async deleteLabel(id) { await delay(); mockData.labels = mockData.labels.filter(x => x.id !== id); return { success: true }; },

  // === COMMENTS ===
  async getComments(cardId) { await delay(50); return mockData.comments.filter(c => c.cardId === cardId).map(c => ({ ...c, author: _findUser(c.authorId) ? { ..._findUser(c.authorId), password: undefined } : null })); },
  async addComment(cardId, data) { await delay(); _ensureAuth(); const c = { id: mockData.comments.length + 1, text: data.text, authorId: _currentUser.id, cardId, createdAt: new Date().toISOString() }; mockData.comments.push(c); return { ...c, author: { ..._currentUser, password: undefined } }; },
  async deleteComment(id) { await delay(); mockData.comments = mockData.comments.filter(c => c.id !== id); return { success: true }; },

  // === INVITATIONS ===
  async inviteMember(boardId, email) { await delay(); _ensureAuth(); const inv = { id: mockData.invitations.length + 1, boardId, email, invitedById: _currentUser.id, status: 'pending', createdAt: new Date().toISOString() }; mockData.invitations.push(inv); return inv; },
  async getInvitations(boardId) { await delay(50); return mockData.invitations.filter(i => i.boardId === boardId); },
  async acceptInvitation(id) { await delay(); const inv = mockData.invitations.find(i => i.id === id); if (!inv) throw new Error('Invitation introuvable.'); inv.status = 'accepted'; if (!mockData.boardMembers[inv.boardId]) mockData.boardMembers[inv.boardId] = []; const user = mockData.users.find(u => u.email === inv.email); if (user && !mockData.boardMembers[inv.boardId].includes(user.id)) mockData.boardMembers[inv.boardId].push(user.id); return inv; },
};

// === TESTS ===
async function testApi() {
  const results = [];
  const ok = (name) => { results.push({ name, passed: true }); console.log('  ✅', name); };
  const fail = (name, err) => { results.push({ name, passed: false, error: err }); console.log('  ❌', name, '-', err); };
  console.group('🧪 ProTask — Tests API');

  try { const r = await demoApi.register({ name: 'Test', email: 'test@test.com', password: 'test1234' }); if (r.user && r.token) ok('register'); else fail('register', 'Réponse invalide'); } catch (e) { fail('register', e.message); }
  try { const r = await demoApi.register({ name: 'Test2', email: 'test@test.com', password: 'test' }); fail('register duplicate', 'Aurait dû échouer'); } catch (e) { ok('register duplicate'); }
  setCurrentUser(null);
  try { const r = await demoApi.login({ email: 'test@test.com', password: 'test1234' }); if (r.user && r.token) ok('login'); else fail('login', 'Réponse invalide'); } catch (e) { fail('login', e.message); }
  try { await demoApi.login({ email: 'test@test.com', password: 'wrong' }); fail('login wrong password', 'Aurait dû échouer'); } catch (e) { ok('login wrong password'); }
  try { const me = await demoApi.getMe(); if (me.email === 'test@test.com') ok('getMe'); else fail('getMe', 'Email incorrect'); } catch (e) { fail('getMe', e.message); }
  try { await demoApi.updateMe({ name: 'Test Updated' }); const me = await demoApi.getMe(); if (me.name === 'Test Updated') ok('updateMe'); else fail('updateMe', 'Nom non mis à jour'); } catch (e) { fail('updateMe', e.message); }
  let boardId, columnId, cardId;
  try { const b = await demoApi.createBoard({ title: 'Test Board' }); boardId = b.id; if (b.title === 'Test Board') ok('createBoard'); else fail('createBoard', 'Titre incorrect'); } catch (e) { fail('createBoard', e.message); }
  try { const boards = await demoApi.getBoards(); if (boards.find(b => b.id === boardId)) ok('getBoards'); else fail('getBoards', 'Board non trouvé'); } catch (e) { fail('getBoards', e.message); }
  try { const cols = await demoApi.getColumns(boardId); columnId = cols[0].id; if (cols.length === 3) ok('getColumns (default cols)'); else fail('getColumns', 'Attendu 3 colonnes'); } catch (e) { fail('getColumns', e.message); }
  try { const c = await demoApi.createColumn(boardId, { title: 'Test Column' }); if (c.title === 'Test Column') ok('createColumn'); else fail('createColumn', 'Titre incorrect'); } catch (e) { fail('createColumn', e.message); }
  try { await demoApi.updateColumn(columnId, { title: 'Updated' }); const cols = await demoApi.getColumns(boardId); const found = cols.find(c => c.title === 'Updated'); if (found) ok('updateColumn'); else fail('updateColumn', 'Nom non mis à jour'); } catch (e) { fail('updateColumn', e.message); }
  try { const card = await demoApi.createCard(columnId, { title: 'Test Card' }); cardId = card.id; if (card.title === 'Test Card') ok('createCard'); else fail('createCard', 'Titre incorrect'); } catch (e) { fail('createCard', e.message); }
  try { const cards = await demoApi.getCards(columnId); if (cards.find(c => c.id === cardId)) ok('getCards'); else fail('getCards', 'Carte non trouvée'); } catch (e) { fail('getCards', e.message); }
  try { const card = await demoApi.getCard(cardId); if (card.id === cardId) ok('getCard'); else fail('getCard', 'ID incorrect'); } catch (e) { fail('getCard', e.message); }
  try { await demoApi.updateCard(cardId, { title: 'Updated Card' }); const card = await demoApi.getCard(cardId); if (card.title === 'Updated Card') ok('updateCard'); else fail('updateCard'); } catch (e) { fail('updateCard', e.message); }
  try { await demoApi.addComment(cardId, { text: 'Test comment' }); const comments = await demoApi.getComments(cardId); if (comments.find(c => c.text === 'Test comment')) ok('addComment'); else fail('addComment', 'Commentaire non trouvé'); } catch (e) { fail('addComment', e.message); }
  try { const label = await demoApi.createLabel(boardId, { name: 'Test Label', color: '#FF0000' }); if (label.name === 'Test Label') ok('createLabel'); else fail('createLabel'); } catch (e) { fail('createLabel', e.message); }
  try { const inv = await demoApi.inviteMember(boardId, 'new@test.com'); if (inv.status === 'pending') ok('inviteMember'); else fail('inviteMember'); } catch (e) { fail('inviteMember', e.message); }
  try { await demoApi.moveCard(cardId, columnId + 1, 0); const card = await demoApi.getCard(cardId); if (card.columnId === columnId + 1) ok('moveCard'); else fail('moveCard'); } catch (e) { fail('moveCard', e.message); }
  try { await demoApi.deleteCard(cardId); const cards = await demoApi.getCards(columnId); if (!cards.find(c => c.id === cardId)) ok('deleteCard'); else fail('deleteCard'); } catch (e) { fail('deleteCard', e.message); }
  try { await demoApi.deleteColumn(columnId); const cols = await demoApi.getColumns(boardId); if (!cols.find(c => c.id === columnId)) ok('deleteColumn'); else fail('deleteColumn'); } catch (e) { fail('deleteColumn', e.message); }
  try { await demoApi.deleteBoard(boardId); const boards = await demoApi.getBoards(); if (!boards.find(b => b.id === boardId)) ok('deleteBoard'); else fail('deleteBoard'); } catch (e) { fail('deleteBoard', e.message); }
  try { await demoApi.getMe(); fail('auth guard', 'Aurait dû échouer après logout'); } catch (e) { ok('auth guard'); }
  setCurrentUser(mockData.users[0]);

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  console.log(`\n📊 Résultat: ${passed} ✅ / ${failed} ❌ / ${results.length} total`);
  console.groupEnd();
  return { total: results.length, passed, failed, results };
}

// Auto-login default user for templates
setCurrentUser(mockData.users[0]);
