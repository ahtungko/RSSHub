import { Route } from '@/types';
import got from '@/utils/got';

export const route: Route = {
    path: '/na/:country/:category',
    categories: ['shopping'],
    example: '/uniqlo/na/sg/men',
    parameters: { country: 'currently only supports my, sg, us, jp', category: 'supports `men` `women`, `kids`, `baby`' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'New Arrivals',
    maintainers: ['xkabctt'],
    handler,
};

async function handler(ctx) {
    const { country, category } = ctx.req.param();

    const map = {
        sg: {
            url: 'https://www.uniqlo.com/sg/api/commerce/v3/en/products',
            withFlag: true,
            path: {
                women: 5855,
                men: 5856,
                kids: 5857,
                baby: 5858,
            },
        },
        my: {
            url: 'https://www.uniqlo.com/my/api/commerce/v3/en/products',
            withFlag: true,
            path: {
                women: 5280,
                men: 5282,
                kids: 5283,
                baby: 5285,
            },
        },
        us: {
            url: 'https://www.uniqlo.com/us/api/commerce/v5/en/products',
            withFlag: false,
            path: {
                women: 22210,
                men: 22211,
                kids: 22212,
                baby: 22213,
            },
        },
        jp: {
            url: 'https://www.uniqlo.com/jp/api/commerce/v5/ja/products',
            withFlag: false,
            path: {
                women: 1071,
                men: 1072,
                kids: 1073,
                baby: 1074,
            },
            lang: 'ja',
        },
    };
    const { data } = await got(map[country].url, {
        searchParams: {
            path: map[country].path[category],
            flagCodes: map[country].withFlag ? 'salesStart newSKU,salesStart newSKU,salesStart newSKU' : undefined,
            sort: 1,
            limit: 24,
            offset: 0,
        },
    });

    const items = data.result.items.map((item) => ({
        title: item.name,
        link: `https://www.uniqlo.com/${country}/${map[country].lang || 'en'}/products/${item.productId}`,
        description: `${item.longDescription || item.name}<br><br>Price: ${(item.prices.base || item.prices.promo).currency.symbol}${(item.prices.base || item.prices.promo).value}<br><br>${
            item.images.main.length ? item.images.main.map((image) => `<img src="${image.url || image.image}">`).join('') : ''
        }${item.images.sub.map((image) => `<img src="${image.url || image.image}">`).join('')}`,
    }));

    return {
        title: `Uniqlo ${category} new arrivals in ${country}`,
        link: `https://www.uniqlo.com/${country}/${map[country].lang || 'en'}/feature/new/${category}`,
        item: items,
    };
}
