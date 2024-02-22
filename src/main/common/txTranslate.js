const https = require("https");
const crypto = require("crypto");

function sha256(message, secret = "", encoding) {
    const hmac = crypto.createHmac("sha256", secret);
    return hmac.update(message).digest(encoding);
}

function getHash(message, encoding = "hex") {
    const hash = crypto.createHash("sha256");
    return hash.update(message).digest(encoding);
}

function getDate(timestamp) {
    const date = new Date(timestamp * 1000);
    const year = date.getUTCFullYear();
    const month = ("0" + (date.getUTCMonth() + 1)).slice(-2);
    const day = ("0" + date.getUTCDate()).slice(-2);
    return `${year}-${month}-${day}`;
}

function sendTencentCloudAPIRequest(payload, callback) {
    const SECRET_ID = "xx";
    const SECRET_KEY = "xx";
    const TOKEN = "";

    const host = "tmt.tencentcloudapi.com";
    const service = "tmt";
    const region = "ap-shanghai";
    const action = "TextTranslate";
    const version = "2018-03-21";
    const timestamp = parseInt(String(new Date().getTime() / 1000));
    const date = getDate(timestamp);

    // ************* 步骤 1：拼接规范请求串 *************
    const signedHeaders = "content-type;host";
    const hashedRequestPayload = getHash(payload);
    const httpRequestMethod = "POST";
    const canonicalUri = "/";
    const canonicalQueryString = "";
    const canonicalHeaders =
        "content-type:application/json; charset=utf-8\n" + "host:" + host + "\n";

    const canonicalRequest =
        httpRequestMethod +
        "\n" +
        canonicalUri +
        "\n" +
        canonicalQueryString +
        "\n" +
        canonicalHeaders +
        "\n" +
        signedHeaders +
        "\n" +
        hashedRequestPayload;

    // ************* 步骤 2：拼接待签名字符串 *************
    const algorithm = "TC3-HMAC-SHA256";
    const hashedCanonicalRequest = getHash(canonicalRequest);
    const credentialScope = date + "/" + service + "/" + "tc3_request";
    const stringToSign =
        algorithm +
        "\n" +
        timestamp +
        "\n" +
        credentialScope +
        "\n" +
        hashedCanonicalRequest;

    // ************* 步骤 3：计算签名 *************
    const kDate = sha256(date, "TC3" + SECRET_KEY);
    const kService = sha256(service, kDate);
    const kSigning = sha256("tc3_request", kService);
    const signature = sha256(stringToSign, kSigning, "hex");

    // ************* 步骤 4：拼接 Authorization *************
    const authorization =
        algorithm +
        " " +
        "Credential=" +
        SECRET_ID +
        "/" +
        credentialScope +
        ", " +
        "SignedHeaders=" +
        signedHeaders +
        ", " +
        "Signature=" +
        signature;

    // ************* 步骤 5：构造并发起请求 *************
    const headers = {
        Authorization: authorization,
        "Content-Type": "application/json; charset=utf-8",
        Host: host,
        "X-TC-Action": action,
        "X-TC-Timestamp": timestamp,
        "X-TC-Version": version,
    };

    if (region) {
        headers["X-TC-Region"] = region;
    }
    if (TOKEN) {
        headers["X-TC-Token"] = TOKEN;
    }

    const options = {
        hostname: host,
        method: httpRequestMethod,
        headers,
    };

    const req = https.request(options, (res) => {
        let data = "";
        res.on("data", (chunk) => {
            data += chunk;
        });

        res.on("end", () => {
            callback(null, data); // 调用回调函数，将数据传递给调用者
        });
    });

    req.on("error", (error) => {
        callback(error, null); // 如果发生错误，调用回调函数并传递错误信息
    });

    req.write(payload);
    req.end();
}

module.exports = {sendTencentCloudAPIRequest};
