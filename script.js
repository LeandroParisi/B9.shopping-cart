const itemPrices = {};
let cartTotal = 0;

function sumCartItems (itemId) {
  const cartItems = document.querySelectorAll('.cart__item');
  const cartToPay = document.querySelector('.total-price');
  cartItems.forEach(item => {
    const itemId = item.id;
    const itemPrice = itemPrices[itemId];
    cartTotal += itemPrice;
  })

  cartToPay.innerText = cartTotal.toString();
  localStorage.setItem('cartTotal', cartTotal);

  cartTotal = 0;
}

const saveItems = () => {
  const cart = document.querySelector('.cart__items').innerHTML;
  localStorage.setItem('cart', cart);
};

function clearCart() {
  const cart = document.querySelector('.cart__items');
  while (cart.firstChild !== null) {
    cart.firstChild.remove();
  }
  saveItems();
}

function createEventHandlers() {
  const clearCartButton = document.querySelector('.empty-cart');
  clearCartButton.addEventListener('click', clearCart);
}

function cartItemClickListener(event) {
  const cartItem = event.target;
  const cart = document.querySelector('.cart__items');
  const itemId = cartItem.id;
  cart.removeChild(cartItem);
  sumCartItems(itemId);  
  saveItems();
}

function getCartFromStorage() {
  const storedCart = localStorage.getItem('cart');
  const storedTotalPrice = localStorage.getItem('cartTotal')
  const cart = document.querySelector('.cart__items');
  const cartToPay = document.querySelector('.total-price');


  if (storedTotalPrice === '') console.log('carrinho vazio')
  cartToPay.innerText = storedTotalPrice.toString()

  if (storedCart === '') console.log('carrinho vazio');
  cart.innerHTML = storedCart;
  const cartItems = document.querySelectorAll('.cart__item');
  cartItems.forEach(item => item.addEventListener('click', cartItemClickListener));
}

function createCartItemElement({ id, title, price }) {
  const li = document.createElement('li');
  li.className = 'cart__item';
  li.id = id;
  li.innerText = `SKU: ${id} | NAME: ${title} | PRICE: $${price}`;
  li.addEventListener('click', cartItemClickListener);

  const cart = document.querySelector('.cart__items');
  cart.appendChild(li);
  sumCartItems(id);
  saveItems();
  return li;
}

function addItemToCart() {
  const target = event.target;
  const parent = target.parentElement;
  const itemId = parent.firstChild.innerText;
  const endpoint = `https://api.mercadolibre.com/items/${itemId}`;

  fetch(endpoint)
    .then(response => response.json())
    .then(object => createCartItemElement(object));
}

function createProductImageElement(imageSource) {
  const img = document.createElement('img');
  img.className = 'item__image';
  img.src = imageSource;
  return img;
}

function createCustomElement(element, className, innerText) {
  const e = document.createElement(element);
  e.className = className;
  e.innerText = innerText;
  return e;
}

function getSkuFromProductItem(item) {
  return item.querySelector('span.item__sku').innerText;
}

function createProductItemElement({ id, title, thumbnail }) {
  const section = document.createElement('section');
  section.className = 'item';

  section.appendChild(createCustomElement('span', 'item__sku', id));
  section.appendChild(createCustomElement('span', 'item__title', title));
  section.appendChild(createProductImageElement(thumbnail));
  section.appendChild(createCustomElement('button', 'item__add', 'Adicionar ao carrinho!'));

  const itemsDisplaySection = document.querySelector('.items');
  itemsDisplaySection.appendChild(section);

  section.addEventListener('click', addItemToCart);

  return section;
}

async function fetchProducts(product) {
  const endpoint = `https://api.mercadolibre.com/sites/MLB/search?q=${product}`;

  fetch(endpoint)
    .then(response => response.json())
    .then(object => object.results.forEach(item => {
      createProductItemElement(item);
      const price = item.price;
      const id = item.id;
      itemPrices[id] = price;
    }))
    .then(() => document.querySelector('.loading').remove());

  return 'Produtos retornados';
}

window.onload = async function onload() {
  fetchProducts('computador');
  getCartFromStorage();
  createEventHandlers();
};
