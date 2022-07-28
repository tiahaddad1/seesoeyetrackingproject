import { initiateSeeso } from '../../utils/seeso';
import formatCurrency from '../../utils/formatCurrency';

const productsContainer = document.querySelector('.products-container');
const productCardTemplate = document.getElementById('product-card-template');

[...Array(6)].forEach(x => {
    const productCard = productCardTemplate.content.cloneNode(true);
    productCard.querySelector('.product-image').classList.add('skeleton');
    productCard.querySelector('.product-title').classList.add('skeleton');
    productCard.querySelector('.product-price').classList.add('skeleton');
    productCard.querySelector('.product-rating').classList.add('skeleton');
    productCard.querySelector('.product-description').classList.add('skeleton');
    productsContainer.appendChild(productCard);
});

(async () => {
    await initiateSeeso(onGaze);

    const response = await fetch('https://dummyjson.com/products/?limit=6');
    const products = await response.json();

    productsContainer.innerHTML = '';

    products.products.forEach(product => {
        const productCard = productCardTemplate.content.cloneNode(true);

        productCard.querySelector('.product-image').src = product.thumbnail;
        productCard.querySelector('.product-title').innerText = product.title;
        productCard.querySelector('.product-price').innerText = formatCurrency(product.price);
        productCard.querySelector('.product-rating').innerText = product.rating;
        productCard.querySelector('.product-description').innerText = product.description;

        productsContainer.appendChild(productCard);
    });
})();

function onGaze(gazeInfo) {
    // gaze
}
