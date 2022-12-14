import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { CdkIssue23290Stack } from "../lib/cdk-issue-23290-stack";

export interface AppStageProps extends cdk.StageProps {
  stage: string;
  synthesizerQualifier: cdk.DefaultStackSynthesizerProps["qualifier"];
}

const getSynthesizer = (
  synthesizerQualifier: cdk.DefaultStackSynthesizerProps["qualifier"]
) => {
  return new cdk.DefaultStackSynthesizer({
    qualifier: synthesizerQualifier,
  });
};

export class AppStage extends cdk.Stage {
  constructor(scope: Construct, id: string, props: AppStageProps) {
    super(scope, id, props);

    // to catch the issue you need two parallel installable stacks with lambdas with LogRetention
    new CdkIssue23290Stack(this, "CdkIssue23290StackOne", {
      synthesizer: getSynthesizer(props.synthesizerQualifier),
    });

    new CdkIssue23290Stack(this, "CdkIssue23290StackTwo", {
      synthesizer: getSynthesizer(props.synthesizerQualifier),
    });
  }
}
