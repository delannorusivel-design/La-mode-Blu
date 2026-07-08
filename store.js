/* ===================== CARRINHO ===================== */
const CART_KEY = 'lb-cart';

function getCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  renderCartBadge();
}

function addToCart(productId, size) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;
  const cart = getCart();
  const key = productId + '|' + (size || '-');
  const existing = cart.find(i => i.key === key);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      key,
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      size: size || null,
      qty: 1
    });
  }
  saveCart(cart);
  openCart();
  renderCartItems();
}

function updateQty(key, delta) {
  const cart = getCart();
  const item = cart.find(i => i.key === key);
  if (!item) return;
  item.qty += delta;
  const filtered = item.qty <= 0 ? cart.filter(i => i.key !== key) : cart;
  saveCart(filtered);
  renderCartItems();
}

function removeFromCart(key) {
  const cart = getCart().filter(i => i.key !== key);
  saveCart(cart);
  renderCartItems();
}

function cartTotal() {
  return getCart().reduce((s, i) => s + i.price * i.qty, 0);
}

function fmtBRL(n) {
  return (Number(n) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function renderCartBadge() {
  const count = getCart().reduce((s, i) => s + i.qty, 0);
  const badge = document.getElementById('cart-count');
  if (badge) badge.textContent = count;
}

function renderCartItems() {
  const cart = getCart();
  const list = document.getElementById('cart-items');
  const emptyMsg = document.getElementById('cart-empty');
  const totalEl = document.getElementById('cart-total');

  if (cart.length === 0) {
    list.innerHTML = '';
    emptyMsg.style.display = 'block';
  } else {
    emptyMsg.style.display = 'none';
    list.innerHTML = cart.map(item => `
      <div class="cart-item">
        <div class="cart-item-thumb" style="background-image:url('${item.image}')"></div>
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-meta">${item.size ? 'Tam. ' + item.size : ''}</div>
          <div class="cart-item-price">${fmtBRL(item.price)}</div>
        </div>
        <div class="cart-item-qty">
          <button onclick="updateQty('${item.key}', -1)">−</button>
          <span>${item.qty}</span>
          <button onclick="updateQty('${item.key}', 1)">+</button>
        </div>
        <button class="cart-item-remove" onclick="removeFromCart('${item.key}')" aria-label="Remover">✕</button>
      </div>
    `).join('');
  }
  totalEl.textContent = fmtBRL(cartTotal());
}

function openCart() {
  document.getElementById('cart-drawer').classList.add('active');
  document.getElementById('cart-overlay').classList.add('active');
  renderCartItems();
}

function closeCart() {
  document.getElementById('cart-drawer').classList.remove('active');
  document.getElementById('cart-overlay').classList.remove('active');
}

/* ===================== VITRINE ===================== */
function renderProducts(list) {
  const grid = document.getElementById('product-grid');
  if (!list.length) {
    grid.innerHTML = '<div class="empty-catalog">Nenhuma peça encontrada.</div>';
    return;
  }
  grid.innerHTML = list.map(p => `
    <div class="product-card">
      <div class="product-image" style="background-image:url('${p.image}')" data-fallback="${escapeHtml(p.name.charAt(0))}"></div>
      <div class="product-info">
        <div class="product-category">${escapeHtml(p.category || '')}</div>
        <div class="product-name">${escapeHtml(p.name)}</div>
        <div class="product-price">${fmtBRL(p.price)}</div>
        <div class="product-installments">ou em até 12x no cartão</div>
        ${p.sizes && p.sizes.length ? `
          <div class="size-selector" id="sizes-${p.id}">
            ${p.sizes.map((s, idx) => `<button class="size-btn ${idx === 0 ? 'selected' : ''}" data-size="${s}" onclick="selectSize('${p.id}','${s}',this)">${s}</button>`).join('')}
          </div>` : ''}
        <button class="btn-add" onclick="handleAddToCart('${p.id}')">Adicionar à sacola</button>
      </div>
    </div>
  `).join('');

  // fallback for missing images
  document.querySelectorAll('.product-image').forEach(el => {
    const img = new Image();
    img.onerror = () => {
      el.style.backgroundImage = 'none';
      el.classList.add('img-fallback');
      el.textContent = el.dataset.fallback;
    };
    img.src = el.style.backgroundImage.slice(5, -2);
  });
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

const selectedSizes = {};
function selectSize(productId, size, btn) {
  selectedSizes[productId] = size;
  const container = document.getElementById('sizes-' + productId);
  container.querySelectorAll('.size-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
}

function handleAddToCart(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  const needsSize = product.sizes && product.sizes.length;
  const size = needsSize ? (selectedSizes[productId] || product.sizes[0]) : null;
  addToCart(productId, size);
}

function filterCategory(cat) {
  document.querySelectorAll('.cat-btn').forEach(b => b.classList.toggle('active', b.dataset.cat === cat));
  if (cat === 'todas') {
    renderProducts(PRODUCTS);
  } else {
    renderProducts(PRODUCTS.filter(p => p.category === cat));
  }
}

function renderCategories() {
  const cats = ['todas', ...new Set(PRODUCTS.map(p => p.category).filter(Boolean))];
  const wrap = document.getElementById('category-bar');
  wrap.innerHTML = cats.map(c => `<button class="cat-btn ${c === 'todas' ? 'active' : ''}" data-cat="${c}" onclick="filterCategory('${c}')">${c === 'todas' ? 'Todas as peças' : c}</button>`).join('');
}

/* ===================== CHECKOUT ===================== */
async function goToCheckout() {
  const cart = getCart();
  if (cart.length === 0) {
    alert('Sua sacola está vazia.');
    return;
  }
  const btn = document.getElementById('checkout-btn');
  const originalText = btn.textContent;
  btn.textContent = 'Preparando pagamento...';
  btn.disabled = true;

  try {
    const items = cart.map(i => ({
      title: i.size ? `${i.name} (Tam. ${i.size})` : i.name,
      quantity: i.qty,
      unit_price: i.price
    }));
    const res = await fetch('/api/create-preference', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items })
    });
    if (!res.ok) throw new Error('Falha ao criar pagamento');
    const data = await res.json();
    if (data.init_point) {
      window.location.href = data.init_point;
    } else {
      throw new Error('Sem link de pagamento');
    }
  } catch (err) {
    console.error(err);
    alert('Não foi possível iniciar o pagamento agora. Tente novamente em instantes.');
    btn.textContent = originalText;
    btn.disabled = false;
  }
}

/* ===================== INIT ===================== */
document.addEventListener('DOMContentLoaded', () => {
  renderCategories();
  renderProducts(PRODUCTS);
  renderCartBadge();

  document.getElementById('cart-toggle').addEventListener('click', openCart);
  document.getElementById('cart-close').addEventListener('click', closeCart);
  document.getElementById('cart-overlay').addEventListener('click', closeCart);
  document.getElementById('checkout-btn').addEventListener('click', goToCheckout);

  const search = document.getElementById('search-box');
  if (search) {
    search.addEventListener('input', () => {
      const term = search.value.trim().toLowerCase();
      renderProducts(PRODUCTS.filter(p =>
        p.name.toLowerCase().includes(term) || (p.category || '').toLowerCase().includes(term)
      ));
    });
  }
});
