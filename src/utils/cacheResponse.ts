import { readFile, writeFile } from "node:fs/promises";

export const cacheResponse = async (identifier: string, queryFn: () => Promise<string>) => {
    let fileName = `cached_responses/${identifier}.json`;
    let cachedResponse = await readFile(fileName, {encoding: 'utf8'})
        .catch((_: any) => {
            console.log(`No cached response found for ${identifier}`);
            return null;
        });

    if (cachedResponse !== null) return cachedResponse;

    const fetchedResponse = await queryFn();

    try {
        await writeFile(fileName, fetchedResponse);
    } catch (e) {
        console.log("Could not cache response", e)
    }

    return fetchedResponse;
}