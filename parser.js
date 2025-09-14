// @todo: напишите здесь код парсера

const MappingColorTagAndType = {
    green: 'category',
    blue: 'label',
    red: 'discount',
};

const MappingCurrencySymbolAndCurrencyCode = {
    '$': 'USD',
    '€': 'EUR',
    '₽': 'RUB',
};

/**
 * Возвращает подстроку до знака `—`
 * @param str
 * @return {string} заголовок
 */
function getTitleFromString(str) {
    const SEPARATOR = '—';
    const [title] = str.split(SEPARATOR);

    return title.trim();
}

/**
 * Форматирует дату
 * @param date дата в формате DD/MM/YYYY
 * @return {string} дата в формате DD.MM.YYYY
 */
function formatDate(date) {
    return date.split('/').join('.');
}

/**
 * Генерирует объект с метаинформацией
 * @return {{
 *   title: string,
 *   description: string,
 *   keywords: string[],
 *   language: string,
 *   opengraph: {title: string, image: string, type: string}
 * }}
 */
function generateMetaObject() {
    const headElement = document.head;

    const title = getTitleFromString(document.title);
    const description = headElement.querySelector('[name="description"]').
        content.
        trim();
    const keywords = headElement.querySelector('[name="keywords"]').
        content.
        split(',').
        map(word => word.trim());
    const language = document.documentElement.lang;
    const openGraphTags = headElement.querySelectorAll('[property^="og:"]');
    const opengraph = Array.from(openGraphTags).reduce((acc, tag) => {
        const [, propertyName] = tag.getAttribute('property').split(':');

        if (propertyName === 'title') {
            acc[propertyName] = getTitleFromString(tag.content);
        } else {
            acc[propertyName] = tag.content;
        }

        return acc;
    }, {});

    return {
        title,
        description,
        keywords,
        language,
        opengraph,
    };
}

/**
 * Генерирует объект карточки товара
 * @return {{
 *   id: string,
 *   name: string,
 *   isLiked: boolean,
 *   tags: {[key: string]: string[]},
 *   price: number,
 *   oldPrice: number,
 *   discount: number,
 *   discountPercent: string,
 *   currency: string,
 *   properties: {[key: string]: string},
 *   description: string,
 *   images: {preview: string, full: string, alt: string}[]
 * }}
 */
function generateProductObject() {
    const productElement = document.querySelector('.product');
    const id = productElement.dataset.id;
    const name = productElement.querySelector('h1').textContent.trim();
    const images = Array.from(productElement.querySelectorAll('nav img')).
        map((imgElement) => {
            const preview = imgElement.src;
            const full = imgElement.dataset.src;
            const alt = imgElement.alt;

            return {
                preview,
                full,
                alt,
            };
        });
    const isLiked = productElement.querySelector('.like').
        classList.
        contains('active');
    const tags = Array.from(productElement.querySelector('.tags').children).
        reduce((acc, tagElement) => {
            const classAttrValue = tagElement.classList.item(0);
            const type = MappingColorTagAndType[classAttrValue];
            const text = tagElement.textContent.trim();

            if (!acc[type]) {
                acc[type] = [];
            }

            acc[type].push(text);

            return acc;
        }, {});
    const price = +productElement.querySelector('.price').
        firstChild.
        textContent.
        trim().
        slice(1);
    const oldPrice = +productElement.querySelector('.price span').
        textContent.
        trim().
        slice(1);
    const discount = oldPrice - price;
    const discountPercent = discount
        ? `${(discount * 100 / oldPrice).toFixed(2)}%`
        : '0%';
    const currencySymbol = productElement.querySelector('.price').
        firstChild.
        textContent.
        trim()[0];
    const currency = MappingCurrencySymbolAndCurrencyCode[currencySymbol];
    const properties = Array.from(
        productElement.querySelectorAll('.properties > li')).
        reduce((acc, liElement) => {
            const key = liElement.firstElementChild.textContent.trim();
            const value = liElement.lastElementChild.textContent.trim();

            acc[key] = value;

            return acc;
        }, {});
    productElement.querySelector('.unused')?.removeAttribute('class');
    const description = productElement.querySelector('.description').
        innerHTML.
        trim();

    return {
        id,
        name,
        isLiked,
        tags,
        price,
        oldPrice,
        discount,
        discountPercent,
        currency,
        properties,
        description,
        images,
    };
}

/**
 * Генерирует массив дополнительных товаров
 * @return {
 * {
 *   name: string,
 *   description: string,
 *   image: string,
 *   price: string,
 *   currency: string
 * }[]
 * }
 */
function generateSuggestedProductsArray() {
    return Array.from(document.querySelector('.suggested .items').children,
        (itemElement) => {
            const name = itemElement.querySelector('h3').textContent.trim();
            const description = itemElement.querySelector('p').
                textContent.
                trim();
            const image = itemElement.querySelector('img').src;
            const priceWithCurrency = itemElement.querySelector('b').
                textContent.
                trim();
            const price = priceWithCurrency.slice(1);
            const currency = MappingCurrencySymbolAndCurrencyCode[priceWithCurrency.slice(
                0, 1)];

            return {
                name,
                description,
                image,
                price,
                currency,
            };
        });
}

/**
 * Генерирует массив обзоров
 * @return {
 * {
 *   rating: number,
 *   author: {avatar: string, name: string},
 *   title: string,
 *   description: string,
 *   date: string
 * }[]
 * }
 */
function generateReviewsArray() {
    return Array.from(document.querySelector('.reviews .items').children,
        (itemElement) => {
            const rating = itemElement.querySelectorAll(
                '.rating .filled').length;
            const author = {
                avatar: itemElement.querySelector('.author img').src,
                name: itemElement.querySelector('.author span').
                    textContent.
                    trim(),
            };
            const title = itemElement.querySelector('.title').
                textContent.
                trim();
            const description = itemElement.querySelector('.title').
                nextElementSibling.
                textContent.
                trim();
            const date = formatDate(itemElement.querySelector('.author i').
                textContent.
                trim(),
            );

            return {
                rating,
                author,
                title,
                description,
                date,
            };
        });
}

function parsePage() {
    return {
        meta: generateMetaObject(),
        product: generateProductObject(),
        suggested: generateSuggestedProductsArray(),
        reviews: generateReviewsArray(),
    };
}

window.parsePage = parsePage;
