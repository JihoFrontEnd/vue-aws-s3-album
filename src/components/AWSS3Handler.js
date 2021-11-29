import AWS from "aws-sdk";

export default class {
  #s3
  #article_id
  #region
  #bucketName

  constructor(article_id = "temp") {
    this.#article_id = article_id;
    // dotenv에서 설정한 값을 읽어옵니다.
    this.#region = process.env.VUE_APP_BUCKET_REGION;
    this.#bucketName = process.env.VUE_APP_BUCKET_NAME;

    // AWS 설정에서 Cognito Credential 등록하여 연결
    AWS.config.update({
      region: this.#region,
      credentials: new AWS.CognitoIdentityCredentials({ IdentityPoolId: process.env.VUE_APP_IDENTITY_POOL_ID }),
    });

    // AWS S3 객체를 필드로 생성
    this.#s3 = new AWS.S3({
      apiVersion: "2006-03-01", // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html
      params: { Bucket: this.#bucketName }
    });
  }

  get s3() { return this.#s3; }
  get article_id() { return this.#article_id; }
  get bucketURL() {
    return `https://s3.${this.#region}.amazonaws.com/${this.#bucketName}/`;
  }

  async upload(key, file) {
    return new Promise((resolve, reject) => {
      this.#s3.upload({
        Key: `${this.#article_id}/${key}`,
        Body: file,
        ACL: "public-read"
      }, (error, data) => {
        if (error) {
          console.error({ error });
          reject(error);
          return alert(`Fail to upload: ${error.message}`);
        }
        alert("Success\n", { data });
        resolve(data);
      });
    });
  }

  async delete(key) {
    return new Promise((resolve, reject) => {
      this.#s3.deleteObject(
        { Key: key },
        (err, data) => {
          if (err) {
            reject(err);
            return alert(`Fail to delete: ${key}`);
          }
          resolve(data);
          alert(`Success to delete: ${data}`);
        }
      );
    });
  }

  async readAll() {
    return new Promise((resolve, reject) => {
      this.#s3
      .listObjects({ Delimiter: "/", Prefix: `${this.#article_id}/` })
      .on("error", (err) => reject(err))
      .on("success", (response) => {
        console.log({ response });
        resolve(response.data.Contents.map((i) => ({ ...i, src: `${this.bucketURL}${encodeURIComponent(i.Key)}`})));
      })
      .send();
    });
  }

}