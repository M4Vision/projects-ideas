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
    { id: 1, title: 'Design System', ownerId: 1, description: 'Design system de l\'application', color: '#8B5CF6', categories: ['Design', 'UI/UX'], createdAt: '2025-03-01T09:00:00Z' },
    { id: 2, title: 'Refonte App Mobile', ownerId: 1, description: 'Refonte complète de l\'application mobile', color: '#3B82F6', categories: ['Mobile'], createdAt: '2025-03-10T14:00:00Z' },
    { id: 3, title: 'Marketing Q2', ownerId: 2, description: 'Stratégie marketing pour le Q2', color: '#EF4444', categories: ['Marketing'], createdAt: '2025-04-01T11:00:00Z' },
  ],
  columns: [
    { id: 1, title: 'Backlog', order: 0, boardId: 1, color: '#6B7280', description: 'Tâches en attente de traitement' },
    { id: 2, title: 'En cours', order: 1, boardId: 1, color: '#3B82F6', description: 'Tâches en cours de développement' },
    { id: 3, title: 'Terminé', order: 2, boardId: 1, color: '#10B981', description: 'Tâches terminées et validées' },
    { id: 4, title: 'À faire', order: 0, boardId: 2, color: '#F59E0B', description: 'Tâches planifiées' },
    { id: 5, title: 'En cours', order: 1, boardId: 2, color: '#3B82F6', description: '' },
    { id: 6, title: 'Terminé', order: 2, boardId: 2, color: '#10B981', description: '' },
    { id: 7, title: 'Idées', order: 0, boardId: 3, color: '#8B5CF6', description: 'Idées à explorer' },
    { id: 8, title: 'En production', order: 1, boardId: 3, color: '#EF4444', description: 'Campagnes en cours' },
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
    { id: 1, name: 'Design', color: '#8B5CF6', boardId: 1, description: 'Tâches de design et maquettage' },
    { id: 2, name: 'Dev', color: '#3B82F6', boardId: 1, description: 'Tâches de développement' },
    { id: 3, name: 'Documentation', color: '#10B981', boardId: 1, description: 'Documentation technique' },
    { id: 4, name: 'Urgent', color: '#EF4444', boardId: 1, description: 'Tâches à priorité haute' },
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
  async getUser(id) { await delay(50); const u = mockData.users.find(x => x.id === id); if (!u) throw new Error('Utilisateur introuvable.'); return { ...u, password: undefined }; },

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
    const board = { id: mockData.boards.length + 1, title: data.title, ownerId: _currentUser.id, description: data.description || '', color: data.color || '#000000', categories: data.categories || [], createdAt: new Date().toISOString() };
    mockData.boards.push(board);
    mockData.boardMembers[board.id] = [];
    ['À faire', 'En cours', 'Terminé'].forEach((title, i) => {
      mockData.columns.push({ id: mockData.columns.length + 1, title, order: i, boardId: board.id, color: '#6B7280', description: '' });
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
    const col = { id: mockData.columns.length + 1, title: data.title, order: cols.length, boardId, color: data.color || '#6B7280', description: data.description || '' };
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
  async reorderCards(items) { await delay(); items.forEach(({ id, order }) => { const c = mockData.cards.find(x => x.id === id); if (c) c.order = order; }); return { success: true }; },

  // === LABELS ===
  async getLabels(boardId) { await delay(50); return mockData.labels.filter(l => l.boardId === boardId); },
  async createLabel(boardId, data) { await delay(); const l = { id: mockData.labels.length + 1, name: data.name, color: data.color || '#3B82F6', boardId, description: data.description || '' }; mockData.labels.push(l); return l; },
  async updateLabel(id, data) { await delay(); const l = mockData.labels.find(x => x.id === id); if (!l) throw new Error('Label introuvable.'); Object.assign(l, data); return l; },
  async deleteLabel(id) { await delay(); mockData.labels = mockData.labels.filter(x => x.id !== id); return { success: true }; },

  // === COMMENTS ===
  async getComments(cardId) { await delay(50); return mockData.comments.filter(c => c.cardId === cardId).map(c => ({ ...c, author: _findUser(c.authorId) ? { ..._findUser(c.authorId), password: undefined } : null })); },
  async addComment(cardId, data) { await delay(); _ensureAuth(); const c = { id: mockData.comments.length + 1, text: data.text, authorId: _currentUser.id, cardId, createdAt: new Date().toISOString() }; mockData.comments.push(c); return { ...c, author: { ..._currentUser, password: undefined } }; },
  async deleteComment(id) { await delay(); mockData.comments = mockData.comments.filter(c => c.id !== id); return { success: true }; },

  // === INVITATIONS ===
  async inviteMember(boardId, email) {
    await delay();
    _ensureAuth();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) throw new Error('Format d\'email invalide.');
    const user = mockData.users.find(u => u.email === email);
    if (!user) throw new Error('Aucun utilisateur trouvé avec cet email.');
    const members = mockData.boardMembers[boardId] || [];
    if (members.includes(user.id)) throw new Error('Cet utilisateur est déjà membre du board.');
    const existing = mockData.invitations.find(i => i.boardId === boardId && i.email === email && i.status === 'pending');
    if (existing) throw new Error('Une invitation est déjà en attente pour cet email.');
    const inv = { id: mockData.invitations.length + 1, boardId, email, invitedById: _currentUser.id, status: 'pending', createdAt: new Date().toISOString() };
    mockData.invitations.push(inv);
    return inv;
  },
  async getInvitations(boardId) { await delay(50); return mockData.invitations.filter(i => i.boardId === boardId); },
  async cancelInvitation(id) {
    await delay();
    const inv = mockData.invitations.find(i => i.id === id);
    if (!inv) throw new Error('Invitation introuvable.');
    if (inv.status !== 'pending') throw new Error('Seules les invitations en attente peuvent être annulées.');
    mockData.invitations = mockData.invitations.filter(i => i.id !== id);
    return { success: true };
  },
  async removeMember(boardId, userId) {
    await delay();
    _ensureAuth();
    const b = _findBoard(boardId);
    if (b.ownerId !== _currentUser.id) throw new Error('Seul le propriétaire peut retirer des membres.');
    if (userId === b.ownerId) throw new Error('Vous ne pouvez pas vous retirer vous-même.');
    const members = mockData.boardMembers[boardId] || [];
    if (!members.includes(userId)) throw new Error('Cet utilisateur n\'est pas membre du board.');
    mockData.boardMembers[boardId] = members.filter(id => id !== userId);
    return { success: true };
  },
  async acceptInvitation(id) { await delay(); return demoApi.respondToInvitation(id, 'accepted'); },
  async respondToInvitation(id, status) {
    await delay();
    const inv = mockData.invitations.find(i => i.id === id);
    if (!inv) throw new Error('Invitation introuvable.');
    const board = _findBoard(inv.boardId);
    if (inv.email !== _currentUser.email && board.ownerId !== _currentUser.id) throw new Error('Vous ne pouvez pas répondre à cette invitation.');
    if (!['accepted', 'declined'].includes(status)) throw new Error('Statut invalide.');
    inv.status = status;
    if (status === 'accepted') {
      if (!mockData.boardMembers[inv.boardId]) mockData.boardMembers[inv.boardId] = [];
      const user = mockData.users.find(u => u.email === inv.email);
      if (user && !mockData.boardMembers[inv.boardId].includes(user.id)) mockData.boardMembers[inv.boardId].push(user.id);
    }
    return inv;
  },
};

// === TESTS ===
async function testApi() {
  const results = [];
  const ok = (name) => { results.push({ name, passed: true }); console.log('  ✅', name); };
  const fail = (name, err) => { results.push({ name, passed: false, error: err }); console.log('  ❌', name, '-', err); };
  console.group('🧪 ProTask — Tests API');

  let boardId, columnId, col2Id, cardId, labelId, commentId;

  // ── Auth ──
  try { const r = await demoApi.register({ name: 'Test', email: 'test@test.com', password: 'test1234' }); if (r.user && r.token) ok('register'); else fail('register', 'Réponse invalide'); } catch (e) { fail('register', e.message); }
  try { await demoApi.register({ name: 'Test2', email: 'test@test.com', password: 'test' }); fail('register duplicate', 'Aurait dû échouer'); } catch (e) { ok('register duplicate'); }
  try { await demoApi.logout(); if (!getCurrentUser()) ok('logout'); else fail('logout', 'Utilisateur toujours connecté'); } catch (e) { fail('logout', e.message); }
  try { const r = await demoApi.login({ email: 'test@test.com', password: 'test1234' }); if (r.user && r.token) ok('login'); else fail('login', 'Réponse invalide'); } catch (e) { fail('login', e.message); }
  try { await demoApi.login({ email: 'test@test.com', password: 'wrong' }); fail('login wrong password', 'Aurait dû échouer'); } catch (e) { ok('login wrong password'); }

  // ── Profile ──
  try { const me = await demoApi.getMe(); if (me.email === 'test@test.com') ok('getMe'); else fail('getMe', 'Email incorrect'); } catch (e) { fail('getMe', e.message); }
  try { await demoApi.updateMe({ name: 'Test Updated' }); const me = await demoApi.getMe(); if (me.name === 'Test Updated') ok('updateMe'); else fail('updateMe', 'Nom non mis à jour'); } catch (e) { fail('updateMe', e.message); }

  // ── Boards ──
  try { const b = await demoApi.createBoard({ title: 'Test Board', color: '#FF5722', categories: ['Dev', 'Design'] }); boardId = b.id; if (b.title === 'Test Board' && b.color === '#FF5722' && b.categories.length === 2) ok('createBoard'); else fail('createBoard', 'Propriétés incorrectes'); } catch (e) { fail('createBoard', e.message); }
  try { const boards = await demoApi.getBoards(); if (boards.find(b => b.id === boardId)) ok('getBoards'); else fail('getBoards', 'Board non trouvé'); } catch (e) { fail('getBoards', e.message); }
  try { const b = await demoApi.getBoard(boardId); if (b.columns && b.columns.length === 3 && b.members) ok('getBoard'); else fail('getBoard', 'Colonnes ou membres manquants'); } catch (e) { fail('getBoard', e.message); }
  try { await demoApi.updateBoard(boardId, { title: 'Board Updated', color: '#4CAF50', categories: ['Backend'], description: 'New desc' }); const b = await demoApi.getBoard(boardId); if (b.title === 'Board Updated' && b.color === '#4CAF50' && b.categories[0] === 'Backend' && b.description === 'New desc') ok('updateBoard'); else fail('updateBoard', 'Propriétés non mises à jour'); } catch (e) { fail('updateBoard', e.message); }

  // ── Columns ──
  try { const cols = await demoApi.getColumns(boardId); columnId = cols[0].id; col2Id = cols[1].id; if (cols.length === 3) ok('getColumns'); else fail('getColumns', 'Attendu 3 colonnes'); } catch (e) { fail('getColumns', e.message); }
  let newColId;
  try { const c = await demoApi.createColumn(boardId, { title: 'New Column', color: '#FF9800', description: 'Une colonne de test' }); newColId = c.id; if (c.title === 'New Column' && c.color === '#FF9800' && c.description === 'Une colonne de test') ok('createColumn'); else fail('createColumn', 'Propriétés incorrectes'); } catch (e) { fail('createColumn', e.message); }
  try { await demoApi.updateColumn(columnId, { title: 'Column Updated', color: '#E91E63', description: 'Desc modifiée' }); const cols = await demoApi.getColumns(boardId); const c = cols.find(x => x.id === columnId); if (c && c.title === 'Column Updated' && c.color === '#E91E63' && c.description === 'Desc modifiée') ok('updateColumn'); else fail('updateColumn', 'Propriétés non mises à jour'); } catch (e) { fail('updateColumn', e.message); }
  try { await demoApi.reorderColumns([{ id: columnId, order: 2 }, { id: newColId, order: 0 }]); const b = await demoApi.getBoard(boardId); const c = b.columns.find(x => x.id === columnId); if (c && c.order === 2) ok('reorderColumns'); else fail('reorderColumns', 'Ordre non mis à jour'); } catch (e) { fail('reorderColumns', e.message); }

  // ── Cards ──
  try { const card = await demoApi.createCard(columnId, { title: 'Test Card', description: 'Test desc', dueDate: '2025-12-31' }); cardId = card.id; if (card.title === 'Test Card' && card.description === 'Test desc') ok('createCard'); else fail('createCard', 'Propriétés incorrectes'); } catch (e) { fail('createCard', e.message); }
  try { const cards = await demoApi.getCards(columnId); if (cards.find(c => c.id === cardId)) ok('getCards'); else fail('getCards', 'Carte non trouvée'); } catch (e) { fail('getCards', e.message); }
  try { const card = await demoApi.getCard(cardId); if (card.id && card.labels !== undefined && card.comments !== undefined) ok('getCard'); else fail('getCard', 'Relations manquantes'); } catch (e) { fail('getCard', e.message); }
  try { await demoApi.updateCard(cardId, { title: 'Card Updated', dueDate: '2025-06-15' }); const card = await demoApi.getCard(cardId); if (card.title === 'Card Updated') ok('updateCard'); else fail('updateCard', 'Titre non mis à jour'); } catch (e) { fail('updateCard', e.message); }
  try { await demoApi.moveCard(cardId, col2Id, 0); const card = await demoApi.getCard(cardId); if (card.columnId === col2Id) ok('moveCard'); else fail('moveCard', 'Colonne incorrecte'); } catch (e) { fail('moveCard', e.message); }
  try { await demoApi.reorderCards([{ id: cardId, order: 5 }]); const card = await demoApi.getCard(cardId); if (card.order === 5) ok('reorderCards'); else fail('reorderCards', 'Ordre non mis à jour'); } catch (e) { fail('reorderCards', e.message); }
  try { await demoApi.moveCard(cardId, columnId, 99); } catch (e) { /* back to original column for cleanup */ }

  // ── Comments ──
  try { const c = await demoApi.addComment(cardId, { text: 'Test comment' }); commentId = c.id; if (c.text === 'Test comment' && c.author) ok('addComment'); else fail('addComment', 'Propriétés incorrectes'); } catch (e) { fail('addComment', e.message); }
  try { const comments = await demoApi.getComments(cardId); if (comments.find(c => c.id === commentId)) ok('getComments'); else fail('getComments', 'Commentaire non trouvé'); } catch (e) { fail('getComments', e.message); }
  try { await demoApi.deleteComment(commentId); const comments = await demoApi.getComments(cardId); if (!comments.find(c => c.id === commentId)) ok('deleteComment'); else fail('deleteComment'); } catch (e) { fail('deleteComment', e.message); }

  // ── Labels ──
  try { const l = await demoApi.createLabel(boardId, { name: 'Bug', color: '#FF0000', description: 'Tâches liées aux bugs' }); labelId = l.id; if (l.name === 'Bug' && l.color === '#FF0000' && l.description === 'Tâches liées aux bugs') ok('createLabel'); else fail('createLabel', 'Propriétés incorrectes'); } catch (e) { fail('createLabel', e.message); }
  try { const labels = await demoApi.getLabels(boardId); if (labels.find(l => l.id === labelId)) ok('getLabels'); else fail('getLabels', 'Label non trouvé'); } catch (e) { fail('getLabels', e.message); }
  try { await demoApi.updateLabel(labelId, { name: 'Bug Updated', color: '#00FF00', description: 'Desc modifiée' }); const labels = await demoApi.getLabels(boardId); const l = labels.find(x => x.id === labelId); if (l && l.name === 'Bug Updated' && l.color === '#00FF00' && l.description === 'Desc modifiée') ok('updateLabel'); else fail('updateLabel', 'Propriétés non mises à jour'); } catch (e) { fail('updateLabel', e.message); }
  try { await demoApi.deleteLabel(labelId); const labels = await demoApi.getLabels(boardId); if (!labels.find(l => l.id === labelId)) ok('deleteLabel'); else fail('deleteLabel'); } catch (e) { fail('deleteLabel', e.message); }

  // ── Invitations ──
  let invId;
  let invitedUserId;
  let inv2Id;
  // Register target users for invitation tests
  try { const r = await demoApi.register({ name: 'Invited User', email: 'invited@test.com', password: 'pass1234' }); invitedUserId = r.user.id; ok('register invited user'); } catch (e) { fail('register invited user', e.message); }
  let otherUserId;
  try { const r = await demoApi.register({ name: 'Other User', email: 'other@test.com', password: 'pass1234' }); otherUserId = r.user.id; ok('register other user'); } catch (e) { fail('register other user', e.message); }
  // Log back in as board owner
  try { await demoApi.login({ email: 'test@test.com', password: 'test1234' }); ok('login as owner'); } catch (e) { fail('login as owner', e.message); }

  try { const inv = await demoApi.inviteMember(boardId, 'invited@test.com'); invId = inv.id; if (inv.status === 'pending' && inv.email === 'invited@test.com') ok('inviteMember'); else fail('inviteMember', 'Propriétés incorrectes'); } catch (e) { fail('inviteMember', e.message); }
  try { await demoApi.inviteMember(boardId, 'invited@test.com'); fail('inviteMember already invited', 'Aurait dû échouer'); } catch (e) { ok('inviteMember already invited'); }
  try { await demoApi.inviteMember(boardId, 'nonexistent@test.com'); fail('inviteMember nonexistent user', 'Aurait dû échouer'); } catch (e) { ok('inviteMember nonexistent user'); }
  try { await demoApi.inviteMember(boardId, 'invalid-email'); fail('inviteMember invalid email', 'Aurait dû échouer'); } catch (e) { ok('inviteMember invalid email'); }
  try { const inv = await demoApi.inviteMember(boardId, 'other@test.com'); const oId = inv.id; await demoApi.login({ email: 'other@test.com', password: 'pass1234' }); await demoApi.respondToInvitation(oId, 'accepted'); await demoApi.login({ email: 'test@test.com', password: 'test1234' }); await demoApi.inviteMember(boardId, 'other@test.com'); fail('inviteMember already member', 'Aurait dû échouer'); } catch (e) { ok('inviteMember already member'); }
  try { await demoApi.removeMember(boardId, otherUserId); ok('removeMember cleanup'); } catch (e) { ok('removeMember cleanup', e.message); }
  try { const invs = await demoApi.getInvitations(boardId); if (invs.find(i => i.id === invId)) ok('getInvitations'); else fail('getInvitations', 'Invitation non trouvée'); } catch (e) { fail('getInvitations', e.message); }

  // Log in as invited user to respond
  try { await demoApi.login({ email: 'invited@test.com', password: 'pass1234' }); ok('login as invited'); } catch (e) { fail('login as invited', e.message); }
  try { const inv = await demoApi.respondToInvitation(invId, 'declined'); if (inv.status === 'declined') ok('respondToInvitation decline'); else fail('respondToInvitation decline', 'Statut incorrect'); } catch (e) { fail('respondToInvitation decline', e.message); }
  try { await demoApi.respondToInvitation(invId, 'invalid'); fail('respondToInvitation invalid status', 'Aurait dû échouer'); } catch (e) { ok('respondToInvitation invalid status'); }
  try { await demoApi.respondToInvitation(999, 'accepted'); fail('respondToInvitation not found', 'Aurait dû échouer'); } catch (e) { ok('respondToInvitation not found'); }
  // Invite again, then accept
  try { await demoApi.login({ email: 'test@test.com', password: 'test1234' }); ok('login as owner again'); } catch (e) { fail('login as owner again', e.message); }
  try { const inv = await demoApi.inviteMember(boardId, 'invited@test.com'); inv2Id = inv.id; ok('inviteMember again'); } catch (e) { fail('inviteMember again', e.message); }
  try { await demoApi.login({ email: 'invited@test.com', password: 'pass1234' }); const inv = await demoApi.acceptInvitation(inv2Id); if (inv.status === 'accepted') ok('acceptInvitation'); else fail('acceptInvitation', 'Statut incorrect'); } catch (e) { fail('acceptInvitation', e.message); }
  try { await demoApi.acceptInvitation(999); fail('acceptInvitation not found', 'Aurait dû échouer'); } catch (e) { ok('acceptInvitation not found'); }
  // Wrong user cannot respond
  try { await demoApi.login({ email: 'other@test.com', password: 'pass1234' }); ok('login as other'); } catch (e) { fail('login as other', e.message); }
  try { await demoApi.acceptInvitation(inv2Id); fail('acceptInvitation wrong user', 'Aurait dû échouer'); } catch (e) { ok('acceptInvitation wrong user'); }
  try { await demoApi.respondToInvitation(inv2Id, 'declined'); fail('respondToInvitation wrong user', 'Aurait dû échouer'); } catch (e) { ok('respondToInvitation wrong user'); }

  // Cancel invitation (owner cancels pending invite)
  try { await demoApi.login({ email: 'test@test.com', password: 'test1234' }); const inv = await demoApi.inviteMember(boardId, 'other@test.com'); invId = inv.id; ok('inviteMember for cancel'); } catch (e) { fail('inviteMember for cancel', e.message); }
  try { await demoApi.cancelInvitation(invId); const invs = await demoApi.getInvitations(boardId); if (!invs.find(i => i.id === invId)) ok('cancelInvitation'); else fail('cancelInvitation', 'Invitation toujours présente'); } catch (e) { fail('cancelInvitation', e.message); }
  try { await demoApi.cancelInvitation(999); fail('cancelInvitation not found', 'Aurait dû échouer'); } catch (e) { ok('cancelInvitation not found'); }

  // Remove member
  try { const r = await demoApi.removeMember(boardId, invitedUserId); if (r.success) ok('removeMember'); else fail('removeMember', 'Échec'); } catch (e) { fail('removeMember', e.message); }
  try { await demoApi.removeMember(boardId, 999); fail('removeMember not found', 'Aurait dû échouer'); } catch (e) { ok('removeMember not found'); }
  try { await demoApi.removeMember(boardId, _currentUser.id); fail('removeMember self', 'Aurait dû échouer'); } catch (e) { ok('removeMember self'); }

  // ── Users ──
  try { const u = await demoApi.getUser(1); if (u.name === 'Alexandre' && u.password === undefined) ok('getUser'); else fail('getUser', 'Données incorrectes'); } catch (e) { fail('getUser', e.message); }
  try { await demoApi.getUser(999); fail('getUser not found', 'Aurait dû échouer'); } catch (e) { ok('getUser not found'); }

  // ── Cleanup ──
  try { await demoApi.deleteCard(cardId); const cards = await demoApi.getCards(columnId); if (!cards.find(c => c.id === cardId)) ok('deleteCard'); else fail('deleteCard'); } catch (e) { fail('deleteCard', e.message); }
  try { await demoApi.deleteColumn(newColId); const cols = await demoApi.getColumns(boardId); if (!cols.find(c => c.id === newColId)) ok('deleteColumn'); else fail('deleteColumn'); } catch (e) { fail('deleteColumn', e.message); }
  try { await demoApi.deleteBoard(boardId); const boards = await demoApi.getBoards(); if (!boards.find(b => b.id === boardId)) ok('deleteBoard'); else fail('deleteBoard'); } catch (e) { fail('deleteBoard', e.message); }

  // ── Auth guard ──
  try { await demoApi.logout(); if (!getCurrentUser()) ok('logout (cleanup)'); else fail('logout (cleanup)', 'Utilisateur toujours connecté'); } catch (e) { fail('logout (cleanup)', e.message); }
  try { await demoApi.getMe(); fail('auth guard', 'Aurait dû échouer après logout'); } catch (e) { ok('auth guard'); }

  // Restore default user for templates
  setCurrentUser(mockData.users[0]);

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  console.log(`\n📊 Résultat: ${passed} ✅ / ${failed} ❌ / ${results.length} total`);
  console.groupEnd();
  return { total: results.length, passed, failed, results };
}

// Auto-login default user for templates
setCurrentUser(mockData.users[0]);

// Expose for tests and page.evaluate access
window.demoApi = demoApi;
