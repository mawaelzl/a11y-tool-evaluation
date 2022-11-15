import https from "https";

export const fetch = async (url: string) => {
    return new Promise<string>((resolve, reject) => {
        const req = https.get(url, res => {
            const bodyChunks: Uint8Array[] = [];
            res.on('data', function(chunk) {
                bodyChunks.push(chunk);
            }).on('end', function() {
                const body = Buffer.concat(bodyChunks).toString();
                resolve(body);
            })
        });

        req.on('error', reject);
    })
}


