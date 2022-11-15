export namespace Base64 {
    export const encode = (str: string) => Buffer.from(str).toString('base64');
    export const decode = (b64Str: string) => Buffer.from(b64Str, "base64").toString('utf-8');
}
