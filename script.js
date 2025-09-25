let allProducts = [];
let cart = [];
let currentPage = 1;
const itemsPerPage = 5;

const grid = document.querySelector('.grid');
const cartSidebar = document.getElementById('cart-sidebar');
const cartBtn = document.getElementById('cart-btn');
const closeCart = document.getElementById('close-cart');
const cartItemsContainer = document.getElementById('cart-items');
const totalDisplay = document.getElementById('total');
const searchInput = document.getElementById('search');
const sortSelect = document.getElementById('sort');
const paginationContainer = document.getElementById('pagination');

// Fetch products
fetch('./products.json')
  .then(res => res.json())
  .then(products => {
    allProducts = products;
    renderFilteredSortedPaginated();
    loadCartFromStorage(products);
  });

// Render filtered, sorted, paginated products
function renderFilteredSortedPaginated() {
  const query = searchInput.value.toLowerCase();
  let filtered = allProducts.filter(p =>
    p.name.toLowerCase().includes(query) ||
    p.description.toLowerCase().includes(query)
  );

  // Sorting
  const sortValue = sortSelect.value;
  if (sortValue === "low-high") filtered.sort((a, b) => a.price - b.price);
  else if (sortValue === "high-low") filtered.sort((a, b) => b.price - a.price);
  else if (sortValue === "az") filtered.sort((a, b) => a.name.localeCompare(b.name));

  // Pagination
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  if (currentPage > totalPages) currentPage = totalPages || 1;
  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const paginatedProducts = filtered.slice(start, end);

  displayProducts(paginatedProducts);
  renderPagination(totalPages);
}

// Render pagination buttons with Prev/Next
function renderPagination(totalPages) {
  paginationContainer.innerHTML = '';

  // Prev button
  const prevBtn = document.createElement('button');
  prevBtn.textContent = 'Prev';
  prevBtn.classList.add('page-btn');
  if (currentPage === 1) prevBtn.classList.add('disabled');
  prevBtn.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      renderFilteredSortedPaginated();
    }
  });
  paginationContainer.appendChild(prevBtn);

  // Numbered pages
  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement('button');
    btn.classList.add('page-btn');
    if (i === currentPage) btn.classList.add('active');
    btn.textContent = i;
    btn.addEventListener('click', () => {
      currentPage = i;
      renderFilteredSortedPaginated();
    });
    paginationContainer.appendChild(btn);
  }

  // Next button
  const nextBtn = document.createElement('button');
  nextBtn.textContent = 'Next';
  nextBtn.classList.add('page-btn');
  if (currentPage === totalPages || totalPages === 0) nextBtn.classList.add('disabled');
  nextBtn.addEventListener('click', () => {
    if (currentPage < totalPages) {
      currentPage++;
      renderFilteredSortedPaginated();
    }
  });
  paginationContainer.appendChild(nextBtn);
}

// Display products in grid
function displayProducts(products) {
  grid.innerHTML = '';
  if (products.length === 0) {
    grid.innerHTML = `<p style="color:white; font-size:1.2rem;">No products found.</p>`;
    return;
  }

  products.forEach(product => {
    const card = document.createElement('div');
    card.classList.add('card');
    card.innerHTML = `
      <img src="${product.image}" alt="${product.name}">
      <h3>${product.name}</h3>
      <p class="description">${product.description}</p>
      <p class="price">$${product.price.toFixed(2)}</p>
      <button data-id="${product.id}">Add to Cart</button>
    `;
    grid.appendChild(card);

    const button = card.querySelector('button');
    button.addEventListener('click', () => toggleCartItem(product, button));

    if (cart.find(item => item.id === product.id)) {
      button.textContent = 'Added to Cart';
      button.classList.add('added');
    }
  });
}

// Toggle add/remove cart item
function toggleCartItem(product, button) {
  const index = cart.findIndex(item => item.id === product.id);
  if (index === -1) {
    cart.push(product);
    button.textContent = 'Added to Cart';
    button.classList.add('added');
  } else {
    cart.splice(index, 1);
    button.textContent = 'Add to Cart';
    button.classList.remove('added');
  }
  saveCartToStorage();
  updateCartDisplay();
}

// Update sidebar cart
function updateCartDisplay() {
  cartItemsContainer.innerHTML = '';
  let total = 0;

  cart.forEach(item => {
    const div = document.createElement('div');
    div.classList.add('cart-item');
    div.innerHTML = `
      <img src="${item.image}" alt="${item.name}">
      <div class="cart-item-info">
        <h4>${item.name}</h4>
        <p>$${item.price.toFixed(2)}</p>
      </div>
      <button data-id="${item.id}">Remove</button>
    `;
    cartItemsContainer.appendChild(div);
    total += item.price;

    div.querySelector('button').addEventListener('click', () => {
      toggleCartItem(item, document.querySelector(`button[data-id="${item.id}"]`));
    });
  });

  totalDisplay.textContent = `Total: $${total.toFixed(2)}`;

  if (cart.length > 0) {
    cartBtn.textContent = `Cart (${cart.length})`;
  } else {
    cartBtn.textContent = 'Cart';
    cartSidebar.classList.remove('active'); // closes sidebar if empty
  }
}

// Save/load cart
function saveCartToStorage() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function loadCartFromStorage(products) {
  const storedCart = JSON.parse(localStorage.getItem('cart')) || [];
  cart = storedCart;
  updateCartDisplay();

  cart.forEach(item => {
    const button = document.querySelector(`button[data-id="${item.id}"]`);
    if (button) {
      button.textContent = 'Added to Cart';
      button.classList.add('added');
    }
  });
}

// Sidebar toggle
cartBtn.addEventListener('click', () => {
  cartSidebar.classList.add('active');
});
closeCart.addEventListener('click', () => {
  cartSidebar.classList.remove('active');
});

// Search & sort events
searchInput.addEventListener('input', () => {
  currentPage = 1;
  renderFilteredSortedPaginated();
});
sortSelect.addEventListener('change', () => {
  currentPage = 1;
  renderFilteredSortedPaginated();
});
