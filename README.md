# POC - cdk-issue-23290

Version: 1.1 2022-12-14 07:30 GMT+01

POC repository for reproduce aws-cdk zipping asset racecondition issue when use `cdk deploy --all --concurrency 2 ...`
Link: https://github.com/aws/aws-cdk/issues/23290

## Prerequisities

* node >= v16.19.0 - eg. use [nvm](https://github.com/nvm-sh/nvm) or another node version manager `nvm install 16`
  ```shell
  node --version
  v16.19.0
  ```
* use `npm i`
* aws-cdk >= 2.53.0
    ```shell
    npm run cdk -- --version

    > cdk-issue-23290@0.1.0 cdk
    > cdk --version

    2.53.0 (build 7690f43)
    ```
* typescript >= 3.9.10
    ```shell
    npm run build -- --version

    > cdk-issue-23290@0.1.0 build
    > tsc --version

    Version 3.9.10
    ```
## Prepare aws account/region (requires high IAM priviledges)

* newly bootstraped account with extra qualifier/cdktoolkit stack name `npm run cdk -- bootstrap --qualifier issue23290 --toolkit-stack-name CDKToolkitIssue23290` (used in example code Synthesizer props, for better cleanup)
* or you must delete `eb5b005c858404ea0c8f68098ed5dcdf5340e02461f149751d10f59c210d5ef8.zip` assets in your asset S3 bucket manualy eg. in `s3://cdk-issue23290-assets-*/*`
* or use clean aws account **without previous cdk deploy history**

> This project was initialized with `npx cdk@2.53.0 init app --language typescript`, no need to run again.

## Synthesis + diff part

Note ⚠: Always clean `cdk.out/` if you repeat the process (when you don't hit the issue), also don't forget delete `eb5b005c858404ea0c8f68098ed5dcdf5340e02461f149751d10f59c210d5ef8.zip` from S3 bucket `s3://cdk-issue23290-assets-*/*`, when you succesfully/partialy deploy.

```shell
# rm -rf cdk.out/ ## optional
# aws s3api delete-object --key eb5b005c858404ea0c8f68098ed5dcdf5340e02461f149751d10f59c210d5ef8.zip --bucket $(aws cloudformation describe-stacks --stack-name CDKToolkitIssue23290 --query 'Stacks[*].Outputs[?OutputKey == `BucketName`][].{value:OutputValue}' --output text) ## optional
npm run cdk -- synth
npm run cdk -- diff --app 'cdk.out/assembly-prod/'
```


## Deploy with --concurency 2 (can fail)


* use `--concurrency 2`
* ⚠ project needs [two independent stacks with lambdas](./lib/app-stage.ts#L22-L29) using [LogRetention](./lib/cdk-issue-23290-stack.ts#L16)
* use `--require-approval never`


```
npm run cdk -- deploy --all --concurrency 2 --app 'cdk.out/assembly-prod/' --require-approval never
```

This can create different states:
* ✅ everything is ok
* ⚠ temporal error - see ENOENT error and one of both stacks will not start to install (local temporal error), second release usually works
* ❌ persistent error - ENOENT create corrupted `eb5b005c858404ea0c8f68098ed5dcdf5340e02461f149751d10f59c210d5ef8.zip`, very frustrating error, stack hangs and needs manualy Cancel update stack in cloudformation (aws console) or wait, maybe 1 to 1.5 hours waiting to go from `UPDATE_ROLLBACK_COMPLETE_CLEANUP_IN_PROGRESS` into `UPDATE_ROLLBACK_COMPLETE`, keep calm ;) Any other `cdk deploy` fails, always. Recovery is possible by removing corrupted `eb5b005c858404ea0c8f68098ed5dcdf5340e02461f149751d10f59c210d5ef8.zip` from your cdk asset S3 bucket.

> If everything is OK, clean-up your asset S3 bucket (error is random, but reproducible with some patience). Also remove always content of `cdk.out/` dir and run new clean `cdk synth ...` and `cdk deploy ...`

### Temporal error

Output is something similar
```
> cdk-issue-23290@0.1.0 cdk
> cdk deploy --all --concurrency 2 --app cdk.out/assembly-prod/ --require-approval never


✨  Synthesis time: 0.41s

prod/CdkIssue23290StackOne (prod-CdkIssue23290StackOne): building assets...

[0%] start: Building eb5b005c858404ea0c8f68098ed5dcdf5340e02461f149751d10f59c210d5ef8:current_account-current_region
[0%] start: Building 5ddda02fd5046ca7a74ed838cb39d184a31c8d6c5b7f5711460cbc9be84da43b:current_account-current_region
[50%] success: Built eb5b005c858404ea0c8f68098ed5dcdf5340e02461f149751d10f59c210d5ef8:current_account-current_region
[100%] success: Built 5ddda02fd5046ca7a74ed838cb39d184a31c8d6c5b7f5711460cbc9be84da43b:current_account-current_region

prod/CdkIssue23290StackOne (prod-CdkIssue23290StackOne): assets built

prod/CdkIssue23290StackTwo (prod-CdkIssue23290StackTwo): building assets...

[0%] start: Building eb5b005c858404ea0c8f68098ed5dcdf5340e02461f149751d10f59c210d5ef8:current_account-current_region
[0%] start: Building 2ca23d4fcb738b5bbe16b3faac460cf808fb2f9620fa82df39edb83d92e8f64c:current_account-current_region
[50%] success: Built eb5b005c858404ea0c8f68098ed5dcdf5340e02461f149751d10f59c210d5ef8:current_account-current_region
[100%] success: Built 2ca23d4fcb738b5bbe16b3faac460cf808fb2f9620fa82df39edb83d92e8f64c:current_account-current_region

prod/CdkIssue23290StackTwo (prod-CdkIssue23290StackTwo): assets built

prod/CdkIssue23290StackOne (prod-CdkIssue23290StackOne)
prod/CdkIssue23290StackOne (prod-CdkIssue23290StackOne): deploying...
prod/CdkIssue23290StackTwo (prod-CdkIssue23290StackTwo)
prod/CdkIssue23290StackTwo (prod-CdkIssue23290StackTwo): deploying...
[0%] start: Publishing eb5b005c858404ea0c8f68098ed5dcdf5340e02461f149751d10f59c210d5ef8:current_account-current_region
[0%] start: Publishing 5ddda02fd5046ca7a74ed838cb39d184a31c8d6c5b7f5711460cbc9be84da43b:current_account-current_region
[0%] start: Publishing eb5b005c858404ea0c8f68098ed5dcdf5340e02461f149751d10f59c210d5ef8:current_account-current_region
[0%] start: Publishing 2ca23d4fcb738b5bbe16b3faac460cf808fb2f9620fa82df39edb83d92e8f64c:current_account-current_region
[50%] fail: ENOENT: no such file or directory, rename '/home/REDACTEDPATH/cdk-issue-23290/cdk.out/assembly-prod/.cache/eb5b005c858404ea0c8f68098ed5dcdf5340e02461f149751d10f59c210d5ef8.zip._tmp' -> '/home/REDACTEDPATH/cdk-issue-23290/cdk.out/assembly-prod/.cache/eb5b005c858404ea0c8f68098ed5dcdf5340e02461f149751d10f59c210d5ef8.zip'
[50%] success: Published eb5b005c858404ea0c8f68098ed5dcdf5340e02461f149751d10f59c210d5ef8:current_account-current_region
[100%] success: Published 2ca23d4fcb738b5bbe16b3faac460cf808fb2f9620fa82df39edb83d92e8f64c:current_account-current_region
[100%] success: Published 5ddda02fd5046ca7a74ed838cb39d184a31c8d6c5b7f5711460cbc9be84da43b:current_account-current_region

 ❌  prod/CdkIssue23290StackOne (prod-CdkIssue23290StackOne) failed: Error: Failed to publish one or more assets. See the error messages above for more information.
    at publishAssets (/home/REDACTEDPATH/cdk-issue-23290/node_modules/aws-cdk/lib/util/asset-publishing.ts:60:11)
    at processTicksAndRejections (node:internal/process/task_queues:96:5)
    at CloudFormationDeployments.publishStackAssets (/home/REDACTEDPATH/cdk-issue-23290/node_modules/aws-cdk/lib/api/cloudformation-deployments.ts:572:7)
    at CloudFormationDeployments.deployStack (/home/REDACTEDPATH/cdk-issue-23290/node_modules/aws-cdk/lib/api/cloudformation-deployments.ts:419:7)
    at deployStack2 (/home/REDACTEDPATH/cdk-issue-23290/node_modules/aws-cdk/lib/cdk-toolkit.ts:264:24)
    at /home/REDACTEDPATH/cdk-issue-23290/node_modules/aws-cdk/lib/deploy.ts:39:11
    at run (/home/REDACTEDPATH/cdk-issue-23290/node_modules/p-queue/dist/index.js:163:29)
prod-CdkIssue23290StackTwo: creating CloudFormation changeset...
prod-CdkIssue23290StackTwo | 0/8 | 5:50:39 | REVIEW_IN_PROGRESS   | AWS::CloudFormation::Stack | prod-CdkIssue23290StackTwo User Initiated
prod-CdkIssue23290StackTwo | 0/8 | 5:50:45 | CREATE_IN_PROGRESS   | AWS::CloudFormation::Stack | prod-CdkIssue23290StackTwo User Initiated
prod-CdkIssue23290StackTwo | 0/8 | 5:50:48 | CREATE_IN_PROGRESS   | AWS::CDK::Metadata    | prod/CdkIssue23290StackTwo/CDKMetadata/Default (CDKMetadata) 
prod-CdkIssue23290StackTwo | 0/8 | 5:50:48 | CREATE_IN_PROGRESS   | AWS::IAM::Role        | prod/CdkIssue23290StackTwo/LogRetentionaae0aa3c5b4d4f87b02d85b201efdd8a/ServiceRole (LogRetentionaae0aa3c5b4d4f87b02d85b201efdd8aServiceRole9741ECFB) 
prod-CdkIssue23290StackTwo | 0/8 | 5:50:48 | CREATE_IN_PROGRESS   | AWS::IAM::Role        | prod/CdkIssue23290StackTwo/LambdaOne/ServiceRole (LambdaOneServiceRoleB43EBD95) 
prod-CdkIssue23290StackTwo | 0/8 | 5:50:49 | CREATE_IN_PROGRESS   | AWS::IAM::Role        | prod/CdkIssue23290StackTwo/LogRetentionaae0aa3c5b4d4f87b02d85b201efdd8a/ServiceRole (LogRetentionaae0aa3c5b4d4f87b02d85b201efdd8aServiceRole9741ECFB) Resource creation Initiated
prod-CdkIssue23290StackTwo | 0/8 | 5:50:49 | CREATE_IN_PROGRESS   | AWS::IAM::Role        | prod/CdkIssue23290StackTwo/LambdaOne/ServiceRole (LambdaOneServiceRoleB43EBD95) Resource creation Initiated
prod-CdkIssue23290StackTwo | 0/8 | 5:50:50 | CREATE_IN_PROGRESS   | AWS::CDK::Metadata    | prod/CdkIssue23290StackTwo/CDKMetadata/Default (CDKMetadata) Resource creation Initiated
prod-CdkIssue23290StackTwo | 1/8 | 5:50:50 | CREATE_COMPLETE      | AWS::CDK::Metadata    | prod/CdkIssue23290StackTwo/CDKMetadata/Default (CDKMetadata) 
prod-CdkIssue23290StackTwo | 2/8 | 5:51:12 | CREATE_COMPLETE      | AWS::IAM::Role        | prod/CdkIssue23290StackTwo/LogRetentionaae0aa3c5b4d4f87b02d85b201efdd8a/ServiceRole (LogRetentionaae0aa3c5b4d4f87b02d85b201efdd8aServiceRole9741ECFB) 
prod-CdkIssue23290StackTwo | 3/8 | 5:51:12 | CREATE_COMPLETE      | AWS::IAM::Role        | prod/CdkIssue23290StackTwo/LambdaOne/ServiceRole (LambdaOneServiceRoleB43EBD95) 
prod-CdkIssue23290StackTwo | 3/8 | 5:51:14 | CREATE_IN_PROGRESS   | AWS::IAM::Policy      | prod/CdkIssue23290StackTwo/LogRetentionaae0aa3c5b4d4f87b02d85b201efdd8a/ServiceRole/DefaultPolicy (LogRetentionaae0aa3c5b4d4f87b02d85b201efdd8aServiceRoleDefaultPolicyADDA7DEB) 
prod-CdkIssue23290StackTwo | 3/8 | 5:51:14 | CREATE_IN_PROGRESS   | AWS::Lambda::Function | prod/CdkIssue23290StackTwo/LambdaOne (LambdaOne54431625) 
prod-CdkIssue23290StackTwo | 3/8 | 5:51:15 | CREATE_IN_PROGRESS   | AWS::IAM::Policy      | prod/CdkIssue23290StackTwo/LogRetentionaae0aa3c5b4d4f87b02d85b201efdd8a/ServiceRole/DefaultPolicy (LogRetentionaae0aa3c5b4d4f87b02d85b201efdd8aServiceRoleDefaultPolicyADDA7DEB) Resource creation Initiated
prod-CdkIssue23290StackTwo | 3/8 | 5:51:16 | CREATE_IN_PROGRESS   | AWS::Lambda::Function | prod/CdkIssue23290StackTwo/LambdaOne (LambdaOne54431625) Resource creation Initiated
prod-CdkIssue23290StackTwo | 4/8 | 5:51:22 | CREATE_COMPLETE      | AWS::Lambda::Function | prod/CdkIssue23290StackTwo/LambdaOne (LambdaOne54431625) 
prod-CdkIssue23290StackTwo | 5/8 | 5:51:37 | CREATE_COMPLETE      | AWS::IAM::Policy      | prod/CdkIssue23290StackTwo/LogRetentionaae0aa3c5b4d4f87b02d85b201efdd8a/ServiceRole/DefaultPolicy (LogRetentionaae0aa3c5b4d4f87b02d85b201efdd8aServiceRoleDefaultPolicyADDA7DEB) 
prod-CdkIssue23290StackTwo | 5/8 | 5:51:38 | CREATE_IN_PROGRESS   | AWS::Lambda::Function | prod/CdkIssue23290StackTwo/LogRetentionaae0aa3c5b4d4f87b02d85b201efdd8a (LogRetentionaae0aa3c5b4d4f87b02d85b201efdd8aFD4BFC8A) 
prod-CdkIssue23290StackTwo | 5/8 | 5:51:40 | CREATE_IN_PROGRESS   | AWS::Lambda::Function | prod/CdkIssue23290StackTwo/LogRetentionaae0aa3c5b4d4f87b02d85b201efdd8a (LogRetentionaae0aa3c5b4d4f87b02d85b201efdd8aFD4BFC8A) Resource creation Initiated
prod-CdkIssue23290StackTwo | 6/8 | 5:51:46 | CREATE_COMPLETE      | AWS::Lambda::Function | prod/CdkIssue23290StackTwo/LogRetentionaae0aa3c5b4d4f87b02d85b201efdd8a (LogRetentionaae0aa3c5b4d4f87b02d85b201efdd8aFD4BFC8A) 
prod-CdkIssue23290StackTwo | 6/8 | 5:51:47 | CREATE_IN_PROGRESS   | Custom::LogRetention  | prod/CdkIssue23290StackTwo/LambdaOne/LogRetention (LambdaOneLogRetentionA0446483) 
prod-CdkIssue23290StackTwo | 6/8 | 5:51:50 | CREATE_IN_PROGRESS   | Custom::LogRetention  | prod/CdkIssue23290StackTwo/LambdaOne/LogRetention (LambdaOneLogRetentionA0446483) Resource creation Initiated
prod-CdkIssue23290StackTwo | 7/8 | 5:51:50 | CREATE_COMPLETE      | Custom::LogRetention  | prod/CdkIssue23290StackTwo/LambdaOne/LogRetention (LambdaOneLogRetentionA0446483) 
prod-CdkIssue23290StackTwo | 8/8 | 5:51:52 | CREATE_COMPLETE      | AWS::CloudFormation::Stack | prod-CdkIssue23290StackTwo 

 ✅  prod/CdkIssue23290StackTwo (prod-CdkIssue23290StackTwo)

✨  Deployment time: 76.24s

Stack ARN:
arn:aws:cloudformation:eu-central-1:REDACTEDACCOUNT:stack/prod-CdkIssue23290StackTwo/db3707c0-7b6a-11ed-9f5c-061c13a5f6bc

✨  Total time: 76.65s


 ❌ Deployment failed: Error: Stack Deployments Failed: Error: Failed to publish one or more assets. See the error messages above for more information.
    at deployStacks (/home/REDACTEDPATH/cdk-issue-23290/node_modules/aws-cdk/lib/deploy.ts:61:11)
    at processTicksAndRejections (node:internal/process/task_queues:96:5)
    at CdkToolkit.deploy (/home/REDACTEDPATH/cdk-issue-23290/node_modules/aws-cdk/lib/cdk-toolkit.ts:338:7)
    at initCommandLine (/home/REDACTEDPATH/cdk-issue-23290/node_modules/aws-cdk/lib/cli.ts:364:12)

Stack Deployments Failed: Error: Failed to publish one or more assets. See the error messages above for more information.

```

## Cleanup

### Remove app

If any stack fails or hangs (usual deploy is in minute), you will need stop cloudformation stack changeset and wait some time

```
npm run cdk -- destroy --all --concurrency 2 --app 'cdk.out/assembly-prod/'
```
### Remove bootstrap

* delete objects (empty) your bootstraped asset S3 `cdk-issue23290-assets-<account>-<region>`
* delete S3 asset bootstraped bucket `cdk-issue23290-assets-<account>-<region>`
* delete your cloudformation stack `CDKToolkitIssue23290`