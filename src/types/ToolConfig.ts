import { Page } from "puppeteer";

export interface ToolConfig<T> {
    name: string,
    beforeAll?: () => void,
    setupPage?: (page: Page) => Promise<any>,
    evaluate?: (page: Page) => Promise<T>,
    evaluateWithoutPuppeteer?: (url: string) => Promise<T>,
    map: (result: T) => Array<string> | Promise<Array<string>>,
    afterAll?: () => void,
}