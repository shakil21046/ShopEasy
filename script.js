/* -----------------------
   Product data (sample)
   ----------------------- */
const products = [
  
  {id:1,name:'Wireless Earbuds',price:2490,category:'audio',image:"EB.JPG",desc:'Compact true-wireless earbuds with great sound.'},
  {id:2,name:'Bluetooth Speaker',price:3990,category:'audio',image:"BS.jpg",desc:'Portable speaker with long battery life.'},
  {id:3,name:'Smart Lamp',price:1799,category:'home',image:"SL.jpg",desc:'Adjustable smart lamp with warm/cool light modes.'},
  {id:4,name:'Phone Case',price:450,category:'accessory',image:"PC.jpg",desc:'Slim protective case for popular phones.'},
  {id:5,name:'Wireless Charger',price:1299,category:'accessory',image:"WC.jpg",desc:'Fast Qi wireless charger for phones.'},
  {id:6,name:'Air Purifier',price:6990,category:'home',image:"AP.jpg",desc:'Compact purifier for small rooms.'},
  {id:7,name:'Laptop Stand',price:1599,category:'accessory',image:"LS.jpg",desc:'Ergonomic laptop stand, foldable.'},
  {id:8,name:'Gaming Headset',price:3299,category:'audio',image:"GH.jpg",desc:'Comfortable headset with mic.'}
];

/* -----------------------
   App state & helpers
   ----------------------- */
let state = {
  products: products.slice(),
  cart: JSON.parse(localStorage.getItem('plp_cart')||'{}'),
  promo: null
};

const $products = document.getElementById('products');
const $search = document.getElementById('searchInput');
const $filters = document.getElementById('categoryFilters');
const $sort = document.getElementById('sortSelect');
const $cartCount = document.getElementById('cart-count');
const $openCart = document.getElementById('open-cart');
const $cartDrawer = document.getElementById('cartDrawer');
const $closeCart = document.getElementById('closeCart');
const $cartItems = document.getElementById('cartItems');
const $subtotal = document.getElementById('subtotal');
const $total = document.getElementById('total');
const $applyPromo = document.getElementById('applyPromo');
const $promoInput = document.getElementById('promoInput');
const $checkoutBtn = document.getElementById('checkoutBtn');
const $clearCartBtn = document.getElementById('clearCartBtn');

const $productModal = document.getElementById('productModal');
const $modalImage = document.getElementById('modalImage');
const $modalTitle = document.getElementById('modalTitle');
const $modalDesc = document.getElementById('modalDesc');
const $modalPrice = document.getElementById('modalPrice');
const $modalAdd = document.getElementById('modalAdd');
const $modalClose = document.getElementById('modalClose');

let currentModalProduct = null;

/* -----------------------
   Rendering functions
   ----------------------- */
function formatTK(n){ return `৳${n.toLocaleString()}`; }

function renderProducts(list = state.products){
  $products.innerHTML = '';
  if(list.length === 0){
    $products.innerHTML = '<div style="grid-column:1/-1;padding:30px;text-align:center;color:var(--muted)">No products found</div>';
    return;
  }
  for(const p of list){
    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = `
      <div class="thumb"><img loading="lazy" src="${p.image}" alt="${p.name}"/></div>
      <div style="display:flex;flex-direction:column;gap:6px">
        <div class="meta"><div class="title">${p.name}</div><div class="price">${formatTK(p.price)}</div></div>
        <div style="color:var(--muted);font-size:13px">${p.desc}</div>
        <div style="display:flex;gap:8px;margin-top:8px">
          <button data-id="${p.id}" class="add-btn">Add</button>
          <button data-id="${p.id}" class="view-btn" style="background:#efefef;color:#111">View</button>
        </div>
      </div>
    `;
    $products.appendChild(card);
  }
}

function renderCart(){
  $cartItems.innerHTML = '';
  const entries = Object.entries(state.cart);
  if(entries.length === 0){
    $cartItems.innerHTML = '<div style="text-align:center;color:var(--muted)">Your cart is empty</div>';
    $subtotal.textContent = formatTK(0);
    $total.textContent = formatTK(0);
    $cartCount.textContent = 0;
    return;
  }
  let sub = 0;
  for(const [id,qty] of entries){
    const p = products.find(x => x.id === Number(id));
    const row = document.createElement('div');
    row.className = 'cart-item';
    const itemTotal = p.price * qty;
    sub += itemTotal;
    row.innerHTML = `
      <img src="${p.image}" alt="${p.name}" />
      <div style="flex:1">
        <div style="display:flex;justify-content:space-between;align-items:center"><strong>${p.name}</strong><div>${formatTK(itemTotal)}</div></div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:6px">
          <div class="qty">
            <button data-id="${p.id}" class="qty-minus">-</button>
            <div style="padding:6px 10px;border-radius:6px;border:1px solid #eee">${qty}</div>
            <button data-id="${p.id}" class="qty-plus">+</button>
          </div>
          <button data-id="${p.id}" class="remove" style="background:transparent;border:0;cursor:pointer;color:#d00">Remove</button>
        </div>
      </div>
    `;
    $cartItems.appendChild(row);
  }
  const promoDiscount = state.promo === 'SAVE10' ? Math.round(sub * 0.1) : 0;
  const total = sub - promoDiscount;
  $subtotal.textContent = formatTK(sub);
  $total.textContent = formatTK(total);
  $cartCount.textContent = entries.reduce((s,[,q])=>s+q,0);
  saveCart();
}

/* -----------------------
   Cart manipulation
   ----------------------- */
function addToCart(id, qty = 1){
  id = String(id);
  state.cart[id] = (state.cart[id]||0) + qty;
  renderCart();
  toast('Added to cart');
}
function removeFromCart(id){
  id = String(id);
  delete state.cart[id];
  renderCart();
}
function changeQty(id, delta){
  id = String(id);
  if(!state.cart[id]) return;
  state.cart[id] += delta;
  if(state.cart[id] <= 0) delete state.cart[id];
  renderCart();
}
function clearCart(){
  state.cart = {};
  state.promo = null;
  $promoInput.value = '';
  renderCart();
}
function applyPromo(){
  const code = ($promoInput.value||'').trim().toUpperCase();
  if(code === 'SAVE10'){
    state.promo = 'SAVE10';
    toast('Promo applied — 10% off');
    renderCart();
  }
  else {
    state.promo = null;
    toast('Invalid promo code');
    renderCart();
  }
}

function checkout(){
  const entries = Object.entries(state.cart);
  if(entries.length === 0){ toast('Cart is empty — add items first'); return; }
  alert(`Thank you!\nSubtotal: ${$subtotal.textContent}\nTotal: ${$total.textContent}\n(Checkout simulated)`);
  clearCart();
  $cartDrawer.classList.remove('open');
}
function saveCart(){ localStorage.setItem('plp_cart', JSON.stringify(state.cart)); }

/* -----------------------
   Search, filter & sort
   ----------------------- */
function applyFilters(){
  const q = ($search.value||'').toLowerCase().trim();
  const activeBtn = $filters.querySelector('button.active');
  const cat = activeBtn ? activeBtn.dataset.category : 'all';
  let list = products.filter(p => (cat === 'all' || p.category === cat));
  if(q) list = list.filter(p => (p.name + ' ' + p.desc).toLowerCase().includes(q));
  const s = $sort.value;
  if(s === 'price-asc') list.sort((a,b)=>a.price-b.price);
  if(s === 'price-desc') list.sort((a,b)=>b.price-a.price);
  state.products = list;
  renderProducts(list);
}

/* -----------------------
   Modal & UI helpers
   ----------------------- */
function openModal(product){
  currentModalProduct = product;
  $modalImage.src = product.image;
  $modalTitle.textContent = product.name;
  $modalDesc.textContent = product.desc;
  $modalPrice.textContent = formatTK(product.price);
  $productModal.classList.add('open');
}
function closeModal(){ currentModalProduct = null; $productModal.classList.remove('open'); }

function toast(msg){
  const t = document.createElement('div');
  t.textContent = msg;
  t.style.position = 'fixed'; t.style.bottom='20px'; t.style.left='50%'; t.style.transform='translateX(-50%)';
  t.style.background='#111'; t.style.color='#fff'; t.style.padding='8px 12px'; t.style.borderRadius='8px'; t.style.zIndex=120;
  document.body.appendChild(t);
  setTimeout(()=>{ t.style.opacity=0; setTimeout(()=>t.remove(),400) },1200);
}

/* -----------------------
   Form validation (contact)
   ----------------------- */
const contactForm = document.getElementById('contactForm');
const formFeedback = document.getElementById('formFeedback');

contactForm.addEventListener('submit', (e)=>{
  e.preventDefault();
  formFeedback.textContent = '';
  const name = document.getElementById('cf-name').value.trim();
  const email = document.getElementById('cf-email').value.trim();
  const message = document.getElementById('cf-message').value.trim();

  if(!name){ formFeedback.style.color = 'red'; formFeedback.textContent = 'Name is required'; return; }
  const emailPattern = /^[^ ]+@[^ ]+\.[a-z]{2,}$/i;
  if(!email){ formFeedback.style.color = 'red'; formFeedback.textContent = 'Email is required'; return; }
  if(!emailPattern.test(email)){ formFeedback.style.color = 'red'; formFeedback.textContent = 'Invalid email format'; return; }
  if(message.length < 10){ formFeedback.style.color = 'red'; formFeedback.textContent = 'Message must be at least 10 characters'; return; }

  formFeedback.style.color = 'green';
  formFeedback.textContent = 'Message sent successfully! (simulated)';
  contactForm.reset();
});

/* -----------------------
   DOM / Event wiring
   ----------------------- */
document.addEventListener('click', (e)=>{
  if(e.target.matches('.add-btn')){ addToCart(e.target.dataset.id); }
  if(e.target.matches('.view-btn')){
    const id = Number(e.target.dataset.id);
    const p = products.find(x=>x.id===id);
    openModal(p);
  }
  if(e.target === $openCart || e.target.closest('#open-cart')){ $cartDrawer.classList.add('open'); }
  if(e.target === $closeCart || e.target.closest('#closeCart')){ $cartDrawer.classList.remove('open'); }
  if(e.target.matches('.qty-plus')){ changeQty(e.target.dataset.id, 1); }
  if(e.target.matches('.qty-minus')){ changeQty(e.target.dataset.id, -1); }
  if(e.target.matches('.remove')){ removeFromCart(e.target.dataset.id); }
});

$filters.addEventListener('click', (e)=>{
  if(e.target.tagName === 'BUTTON'){
    [...$filters.children].forEach(b=>b.classList.remove('active'));
    e.target.classList.add('active');
    applyFilters();
  }
});

$search.addEventListener('input', ()=>applyFilters());
$sort.addEventListener('change', ()=>applyFilters());

$modalClose.addEventListener('click', ()=>closeModal());
$modalAdd.addEventListener('click', ()=>{ if(currentModalProduct){ addToCart(currentModalProduct.id); closeModal(); $cartDrawer.classList.add('open'); }});
$productModal.addEventListener('click', (e)=>{ if(e.target === $productModal) closeModal();});

$applyPromo.addEventListener('click', applyPromo);
$checkoutBtn.addEventListener('click', checkout);
$clearCartBtn.addEventListener('click', clearCart);

/* initialize */
renderProducts();
renderCart();
