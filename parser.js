// @todo: напишите здесь код парсера

/**
 * Генерирует объект с метаинформацией
 * @return {{title: String, description: String, keywords: String[], language: String, opengraph: Object}} Объект с метаинформацией
 */
function generateMetaObject() {
    const headElement = document.head;

    let [title] = headElement.querySelector('title').textContent.split('—');
    title = title.trim();
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
        acc[propertyName] = tag.content;

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
 * id: String,
 * name: String,
 * isLiked: Boolean,
 * tags: Object[],
 * price: Number
 * oldPrice: Number,
 * discount: Number,
 * discountPercent: String,
 * currency: String,
 * properties: Object,
 * description: String,
 * images: Object[]
 * }}
 */
function generateProductObject() {
    const productElement = document.querySelector('.product');
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
    const description = productElement.querySelector('.description').
        textContent.
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

function parsePage() {
    return {
        meta: generateMetaObject(),
        product: generateProductObject(),
        suggested: [],
        reviews: [],
    };
}

window.parsePage = parsePage;
