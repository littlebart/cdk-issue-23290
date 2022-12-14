# POC - cdk-issue-23290

POC repository for reproduce aws-cdk zipping asset racecondition issue when use `cdk deploy deploy --concurrency ...`
Link: https://github.com/aws/aws-cdk/issues/23290

## Prerequisities

* node >= v16.19.0 - eg. use [nvm](https://github.com/nvm-sh/nvm) or another node version manager `nvm install 16`
  ```
  node --version
  v16.19.0
  ```
* aws-cdk >= 2.53.0 - `npx cdk@2.53.0 init app --language typescript`
    ```shell
    npm run cdk -- --version

    > cdk-issue-23290@0.1.0 cdk
    > cdk --version

    2.53.0 (build 7690f43)
    ```

* aws account/region without asset history
  * bootstraped account with qualifier `npm run cdk -- bootstrap --qualifier issue23290 --toolkit-stack-name CDKToolkitIssue23290` (used in code Synthesizer option)
  * or use clean aws account **without previous cdk deploy history**
  * or you must clean some assets adequate to lambdas in asset S3 bucket `s3://cdk-issue23290-assets-*/*` (or normal `s3://cdk-hnb659fds-assets-*/*` if you will change the qualifier)

