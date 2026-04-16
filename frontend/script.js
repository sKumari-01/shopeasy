const API = 'https://shopeasy-1-sxhy.onrender.com';

function formatRupee(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0
  }).format(amount);
}

function showToast(message) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

function createProductCard(product) {
  return `
    <div class="product-card">
      <img src="${product.imageUrl}" alt="${product.name}" loading="lazy"/>
      <div class="card-body">
        <div class="product-category">${product.category}</div>
        <div class="product-name">${product.name}</div>
        <div class="product-desc">${product.description}</div>
        <div class="product-rating">&#11088; ${product.rating.toFixed(1)} (${product.reviewCount.toLocaleString()})</div>
      </div>
      <div class="product-footer">
        <div class="product-price">${formatRupee(product.price)}</div>
        <button class="add-to-cart" onclick="addToCart(${product.id}, '${product.name.replace(/'/g, "\\'")}')">&#128722; Add</button>
      </div>
    </div>
  `;
}

async function loadProducts(category, search, containerId = 'productGrid') {
  const grid = document.getElementById(containerId);
  if (!grid) return;
  grid.innerHTML = '<p style="text-align:center;padding:60px;color:#6b7280;font-size:16px;">Loading products...</p>';

  let url = `${API}/products`;
  const params = new URLSearchParams();
  if (category) params.append('category', category);
  if (search) params.append('search', search);
  if (params.toString()) url += '?' + params.toString();

  try {
    const res = await fetch(url);
    const products = await res.json();
    if (!products.length) {
      grid.innerHTML = '<p style="text-align:center;padding:60px;color:#6b7280;font-size:16px;">No products found.</p>';
    } else {
      grid.innerHTML = products.map(createProductCard).join('');
    }
  } catch (e) {
    grid.innerHTML = '<p style="text-align:center;color:red;padding:60px;">Could not load products. Make sure the server is running.</p>';
  }
}

function loadTab(category, btn) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  loadProducts(category);
}

function handleSearch(e) {
  e.preventDefault();
  const q = document.getElementById('searchInput')?.value.trim();
  if (q) window.location.href = `search.html?q=${encodeURIComponent(q)}`;
}

async function updateCartCount() {
  try {
    const res = await fetch(`${API}/cart`);
    const cart = await res.json();
    document.querySelectorAll('#cartCount').forEach(el => {
      el.textContent = cart.itemCount;
    });
  } catch (e) {}
}

async function addToCart(productId, name) {
  try {
    await fetch(`${API}/cart/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, quantity: 1 })
    });
    await updateCartCount();
    showToast(`"${name}" added to cart!`);
  } catch (e) {
    showToast('Failed to add item. Is the server running?');
  }
}

async function loadCart() {
  const container = document.getElementById('cartContent');
  if (!container) return;

  try {
    const res = await fetch(`${API}/cart`);
    const cart = await res.json();

    if (cart.items.length === 0) {
      container.innerHTML = `
        <div class="empty-cart">
          <p style="font-size:64px;margin-bottom:16px">&#128722;</p>
          <h2>Your cart is empty</h2>
          <p>Add some products to get started!</p>
          <br/>
          <a href="index.html" class="btn btn-primary">Start Shopping</a>
        </div>`;
      document.getElementById('summarySubtotal').textContent = formatRupee(0);
      document.getElementById('summaryTotal').textContent = formatRupee(0);
      return;
    }

    container.innerHTML = `
      <div class="cart-actions">
        <span style="color:#6b7280;font-weight:600">${cart.itemCount} item${cart.itemCount !== 1 ? 's' : ''}</span>
        <button class="clear-cart-btn" onclick="clearCart()">&#128465; Clear Cart</button>
      </div>
      <div class="cart-items-list">
        ${cart.items.map(item => `
          <div class="cart-item">
            <img src="${item.product.imageUrl}" alt="${item.product.name}"/>
            <div class="cart-item-info">
              <div class="cart-item-category">${item.product.category}</div>
              <div class="cart-item-name">${item.product.name}</div>
              <div class="quantity-controls">
                <button class="quantity-btn" onclick="updateQty(${item.productId}, ${item.quantity - 1})">&#8722;</button>
                <span class="quantity-num">${item.quantity}</span>
                <button class="quantity-btn" onclick="updateQty(${item.productId}, ${item.quantity + 1})">+</button>
              </div>
            </div>
            <div class="cart-item-right">
              <div class="cart-item-price">${formatRupee(item.product.price * item.quantity)}</div>
              <button class="remove-btn" onclick="removeItem(${item.productId})">Remove</button>
            </div>
          </div>`).join('')}
      </div>`;

    document.getElementById('summarySubtotal').textContent = formatRupee(cart.total);
    document.getElementById('summaryTotal').textContent = formatRupee(cart.total);
    document.querySelectorAll('#cartCount').forEach(el => el.textContent = cart.itemCount);
  } catch (e) {
    container.innerHTML = '<p style="color:red;text-align:center;padding:40px">Could not load cart. Is the server running?</p>';
  }
}

async function updateQty(productId, quantity) {
  if (quantity < 1) return;
  await fetch(`${API}/cart/update`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId, quantity })
  });
  loadCart();
}

async function removeItem(productId) {
  await fetch(`${API}/cart/remove`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId })
  });
  showToast('Item removed from cart.');
  loadCart();
}

async function clearCart() {
  await fetch(`${API}/cart/clear`, { method: 'POST' });
  showToast('Cart cleared.');
  loadCart();
}