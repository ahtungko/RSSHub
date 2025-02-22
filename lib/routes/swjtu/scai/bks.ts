import { Route } from '@/types';
import cache from '@/utils/cache';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import ofetch from '@/utils/ofetch';

const rootURL = 'https://scai.swjtu.edu.cn';
const pageURL = `${rootURL}/web/page-module.html?mid=B730BEB095B31840`;

export const route: Route = {
    path: '/scai/bks',
    categories: ['university'],
    example: '/swjtu/scai/bks',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['scai.swjtu.edu.cn/'],
        },
    ],
    name: '计算机与人工智能学院',
    description: '本科生教育',
    maintainers: ['AzureG03', 'SuperJeason'],
    handler,
};

const getItem = (item, cache) => {
    const title = item.find('a').text();
    const link = `${rootURL}${item.find('a').attr('href').slice(2)}`;

    return cache.tryGet(link, async () => {
        const res = await ofetch(link);
        const $ = load(res);

        // 尝试获取日期
        let dateText = $('div.news-info span:nth-of-type(2)').text();
        if (!dateText) {
            dateText = $('div.news-top-bar span:nth-of-type(1)').text();
        }
        if (!dateText) {
            //   console.error('Date not found for', link);
            return null; // 或者返回一个默认值
        }

        const dateMatch = dateText.match(/\d{4}(-|\/|.)\d{1,2}\1\d{1,2}/);
        if (!dateMatch) {
            //   console.error('Invalid date format for', link);
            return null; // 或者返回一个默认值
        }
        const pubDate = parseDate(dateMatch[0]);
        const description = $('div.content-main').html();

        return {
            title,
            pubDate,
            link,
            description,
        };
    });
};

async function handler() {
    const res = await ofetch(pageURL);

    const $ = load(res);
    const $list = $('div.list-top-item, div.item-wrapper');

    const items = await Promise.all(
        $list.toArray().map((i) => {
            const $item = $(i);
            return getItem($item, cache);
        })
    );

    return {
        title: '西南交大计算机学院-本科生教育',
        link: pageURL,
        item: items,
        allowEmpty: true,
    };
}
