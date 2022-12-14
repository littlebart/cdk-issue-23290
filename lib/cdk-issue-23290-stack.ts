import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { RetentionDays } from "aws-cdk-lib/aws-logs";

export class CdkIssue23290Stack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    new lambda.Function(this, "LambdaOne", {
      runtime: lambda.Runtime.NODEJS_16_X,
      code: lambda.Code.fromInline(
        'exports.handler = async () => "hello world 1";'
      ),
      handler: "index.handler",
      logRetention: RetentionDays.ONE_WEEK,
    });
  }
}
