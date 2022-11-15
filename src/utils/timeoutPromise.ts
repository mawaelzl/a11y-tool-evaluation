import { sleep } from "./sleep";

export const timeoutPromise = async <T>(promise: Promise<T>, timeout: number, errorMessage: string): Promise<T> => {
    return await Promise.race([
        promise,
        sleep(timeout)
            .then(() => {
                throw new Error(errorMessage);
            })
    ]);
}