import { CfnOutput, Stack, StackProps } from "aws-cdk-lib";
import { LambdaRestApi } from "aws-cdk-lib/aws-apigateway";
import { AttributeType, BillingMode, Table } from "aws-cdk-lib/aws-dynamodb";
import { Effect, ManagedPolicy, PolicyStatement, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { CfnParametersCode, Code, Function, Runtime } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";

interface ServiceStackProps extends StackProps {
	stageName: string;
}

export class ServiceStack extends Stack {
	public readonly serviceCode: CfnParametersCode;
	public readonly serviceEndpointOutput: CfnOutput;
	constructor(scope: Construct, id: string, props: ServiceStackProps) {
		super(scope, id, props);

		this.serviceCode = Code.fromCfnParameters();

		const providerTable = new Table(this, 'ProviderTable', {
			partitionKey: {name: 'id', type: AttributeType.STRING},
			billingMode: BillingMode.PAY_PER_REQUEST,
			tableName: 'Provider'
		});

		const lambdaARole = new Role(this, 'LambdaRole', {
			assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
		  });

		  lambdaARole.addManagedPolicy(
			ManagedPolicy.fromAwsManagedPolicyName('AmazonDynamoDBFullAccess')
		  );

		const backend = new Function(this, 'DcareServiceLambda', {
			runtime: Runtime.NODEJS_18_X,
			handler: 'src/lambda.handler',
			code: this.serviceCode,
			functionName: `DcareServiceLambda-${props.stageName}`,
			description: `Generated on ${new Date().toISOString()}`,
			role: lambdaARole,
		});

		// const pol = new PolicyStatement({
		// 	effect: Effect.ALLOW,
		// 	actions: ['dynamo:*'],
		// 	resources: ['*']
		// })

		providerTable.grantReadWriteData(backend);

		const api = new LambdaRestApi(this, 'DCareAPI', {
			handler: backend,
			restApiName: `DayCareApi-${props.stageName}`
		})

	}
}