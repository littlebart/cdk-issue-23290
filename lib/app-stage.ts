import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { CdkIssue23290Stack } from "../lib/cdk-issue-23290-stack";

export interface AppStageProps extends cdk.StageProps {
  stage: string;
  synthesizer: cdk.DefaultStackSynthesizer;
}

export class AppStage extends cdk.Stage {
  constructor(scope: Construct, id: string, props: AppStageProps) {
    super(scope, id, props);

    new CdkIssue23290Stack(this, "CdkIssue23290Stack", {
      synthesizer: props.synthesizer,
    });
  }
}
