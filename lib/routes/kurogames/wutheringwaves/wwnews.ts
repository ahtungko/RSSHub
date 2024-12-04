import { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
import * as cheerio from 'cheerio';
import ofetch from '@/utils/ofetch';

interface NewsItem {
    articleContent: string;
    articleDesc: string;
    articleId: number;
    articleTitle: string;
    articleType: number;
    createTime: string;
    sortingMark: number;
    startTime: string;
    suggestCover: string;
    top: number;
}

export const route: Route = {
    path: '/wutheringwaves/wwnews',
    categories: ['game'],
    example: '/kurogames/wutheringwaves/wwnews',
    name: 'Wuthering Waves— Notice, News and Event',
    radar: [
        {
            source: ['wutheringwaves.kurogames.com/en/main/news', 'wutheringwaves.kurogames.com/en/main'],
        },
    ],
    maintainers: ['xkabctt'],
    description: '',
    async handler() {
        const res = await ofetch<NewsItem[]>('https://hw-media-cdn-mingchao.kurogame.com/akiwebsite/website2.0/json/G152/en/ArticleMenu.json', { query: { t: Date.now() } });
        const item = await Promise.all(
            res.map((i) => {
                const contentUrl = `https://hw-media-cdn-mingchao.kurogame.com/akiwebsite/website2.0/json/G152/en/article/${i.articleId}.json`;
                const item = {
                    title: i.articleTitle,
                    pubDate: timezone(parseDate(i.createTime), +8),
                    link: `https://wutheringwaves.kurogames.com/en/main/news/detail/${i.articleId}`,
                } as DataItem;
                return cache.tryGet(contentUrl, async () => {
                    const data = await ofetch<NewsItem>(contentUrl, { query: { t: Date.now() } });
                    const $ = cheerio.load(data.articleContent);

                    item.description = $.html() ?? i.articleDesc ?? '';
                    return item;
                }) as Promise<DataItem>;
            })
        );
        return {
            title: '《Wuthering Waves》— Notice, News and Event',
            link: 'https://wutheringwaves.kurogames.com/en/main/#news',
            item,
            language: 'en',
        };
    },
};
