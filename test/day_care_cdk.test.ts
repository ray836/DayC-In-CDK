import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { DayCareCdkStack } from '../lib/day_care_cdk-stack';
// import { Template } from 'aws-cdk-lib/assertions';
// import * as DayCareCdk from '../lib/day_care_cdk-stack';

test('Pipeline Stack', () => {
	const app = new cdk.App();
	const stack = new DayCareCdkStack(app, 'MyTestStack');

	const template = Template.fromStack(stack);
	expect(template.toJSON()).toMatchSnapshot();

})
