import { Page } from "puppeteer";
import { sleep } from "./sleep";

//https://stackoverflow.com/a/61304202
export const waitUntilHTMLRendered = async (page: Page, maxWaitTime: number) => {
    const checkDurationMsecs = 1000;
    const maxChecks = maxWaitTime / checkDurationMsecs;
    let lastHTMLSize = 0;
    let checkCounts = 1;
    let countStableSizeIterations = 0;
    const minStableSizeIterations = 3;

    while(checkCounts++ <= maxChecks){
        let html = await page.content();
        let currentHTMLSize = html.length;

        if(lastHTMLSize != 0 && currentHTMLSize == lastHTMLSize)
            countStableSizeIterations++;
        else
            countStableSizeIterations = 0;

        if(countStableSizeIterations >= minStableSizeIterations) {
            break;
        }

        lastHTMLSize = currentHTMLSize;
        await sleep(checkDurationMsecs);
    }
};