#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { AppStage } from "../lib/app-stage";

const synthesizerQualifier: cdk.DefaultStackSynthesizerProps['qualifier'] = "issue23290";

const app = new cdk.App();

new AppStage(app, "prod", {
  stage: "prod",
  synthesizerQualifier,
});
