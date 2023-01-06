import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {AttributeType, BillingMode, Table} from 'aws-cdk-lib/aws-dynamodb';
import {Function, Runtime, Code} from 'aws-cdk-lib/aws-lambda';
import { LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class CdkServerlessStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    //DynamoDB table
    const myTable = new Table(this, 'CDKTable', {
      billingMode: BillingMode.PAY_PER_REQUEST,
      partitionKey: { name: 'id', type: AttributeType.STRING },
      tableName: 'CDKTable',
    });

    //Lambda function
    const myFunction = new Function(this, "CDKDemoFunction", {
      runtime: Runtime.NODEJS_14_X,
      code: Code.fromAsset("resources"),
      handler: "app.handler",
      environment: {
        MY_TABLE: myTable.tableName
      }
    });

    //Permissions for Lambda to run DynamoDB
    myTable.grantReadWriteData(myFunction);

    //API Gateway - this doesn't need to be imported as a package into the application
    const myAPIGateway = new RestApi(this, 'CDKDemoAPIGateway');

    const myFunctionAPIGatewayIntegration = new LambdaIntegration(myFunction, {
      requestTemplates: {"application/jason": '{"statusCode": "200"}'}
    });

    myAPIGateway.root.addMethod("GET", myFunctionAPIGatewayIntegration);


    // example resource
    // const queue = new sqs.Queue(this, 'CdkServerlessQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });
  }
}
