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

function parsePage() {
    return {
        meta: generateMetaObject(),
        product: {},
        suggested: [],
        reviews: [],
    };
}

window.parsePage = parsePage;
