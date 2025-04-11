 
const cdk = require('aws-cdk-lib');
const lambda = require('aws-cdk-lib/aws-lambda');
const apigateway = require('aws-cdk-lib/aws-apigateway');
const iam = require('aws-cdk-lib/aws-iam');
const cognito = require('aws-cdk-lib/aws-cognito');
const sqs = require('aws-cdk-lib/aws-sqs');
const lambdaEventSources = require('aws-cdk-lib/aws-lambda-event-sources');
class AppStack extends cdk.Stack {
   constructor(scope, id, props) {
      super(scope, id, props);
      const { env } = props
      const userPool = new cognito.UserPool(this, 'UserPool', {
         userPoolName: 'Rentte_User_Pool_STG_V2',
         selfSignUpEnabled: true,
         signInAliases: { phone: true, email: true }, // Allow sign-in with phone number and email
         autoVerify: { email: true }, // Auto verify phone number
         standardAttributes: {
            phoneNumber: { required: true, mutable: true },
            email: { required: true, mutable: true },
         },
         customAttributes: {
            firstName: new cognito.StringAttribute({ mutable: true }),
            lastName: new cognito.StringAttribute({ mutable: true }),
            gender: new cognito.StringAttribute({ mutable: true }),
            profession: new cognito.StringAttribute({ mutable: true }),
            dob: new cognito.StringAttribute({ mutable: true }), // Date of birth
         },
      });
    
      const userPoolClient = new cognito.UserPoolClient(this, 'UserPoolClient', {
         userPool,
         generateSecret: false, // No secret is needed for public client
         authFlows: {
            userPassword: true,
         },
      });


      // Define a Lambda function
      const userService = new lambda.Function(this, 'userService', {
         runtime: lambda.Runtime.NODEJS_20_X,
         handler: 'index.handler',
         code: lambda.Code.fromAsset('lambda/user-service'),
         environment: {
            JWT_SECRET_KEY: env.JWT_SECRET_KEY,
            JWT_EXPIRES_IN: env.JWT_EXPIRES_IN,
            PROJECT_NAME: 'Rentte-user',
            IS_SECURE_SWAGGER: 'false',
            DB_HOST: env.DB_HOST,
            DB_PASSWORD: env.DB_PASSWORD,
            PRODUCTION: 'true',
            DB_USER: env.DB_USER,
            DB_NAME: env.DB_NAME,
            DB_PORT: env.DB_PORT,
            AWS_BUCKET_NAME: env.AWS_BUCKET_NAME,
            ID_S3: env.ID_S3,
            KEY_S3: env.KEY_S3,
            COGNITO_USER_POOL_ID: userPool.userPoolId, 
            COGNITO_CLIENT_ID: userPoolClient.userPoolClientId,
            DEBUG: 'false',
            SERVICE_NAME: 'rentte-user',
            USER_RESET_PASSWORD_URL: env.USER_RESET_PASSWORD_URL,
            NODE_ENV: env.NODE_ENV,
            AWS_SES_SENDER: env.AWS_SES_SENDER,
            SMTP_USER: env.SMTP_USER,
            SMTP_PASS: env.SMTP_PASS,
            SMTP_HOST: env.SMTP_HOST,
            SMTP_PORT: env.SMTP_PORT,
            AWS_BUCKET_BLOG: env.AWS_BUCKET_BLOG,
            RENTTE_IMAGE_URL: env.RENTTE_IMAGE_URL,
            HOST_URL: env.HOST_URL,
            USER_SERVICE_API_URL: env.USER_SERVICE_API_URL,
         },
         timeout: cdk.Duration.seconds(30),
         memorySize: 512,

      });
      userService.role.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSESFullAccess'));
      userService.role.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonAPIGatewayInvokeFullAccess'));
      userService.role.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonCognitoPowerUser'));
      userService.role.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonRDSFullAccess'));
      userService.role.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSNSFullAccess'));
      userService.role.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AWSLambda_FullAccess'));
      userService.role.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'));
      userService.role.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaENIManagementAccess'));
      userService.role.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaVPCAccessExecutionRole'));


      // Create an API Gateway REST API with Lambda Proxy Integration
      new apigateway.LambdaRestApi(this, 'userApi', {
         restApiName: 'user-service',
         description: 'This service serves userService Lambda function.',
         handler: userService,
         proxy: true, // This ensures all routes are forwarded to the Lambda function
         binaryMediaTypes: ['image/jpeg', 'image/png', 'image/jpg', '*/*', 'multipart/form-data'],
      });

      // Optional: Define API Gateway Role (if needed for additional configurations)
      const apiGatewayRole = new iam.Role(this, 'ApiGatewayRole', {
         assumedBy: new iam.ServicePrincipal('apigateway.amazonaws.com'),
      });

      apiGatewayRole.addToPolicy(new iam.PolicyStatement({
         resources: [userService.functionArn],
         actions: ['lambda:InvokeFunction'],
      }));

      const adminService = new lambda.Function(this, 'adminService', {
         runtime: lambda.Runtime.NODEJS_20_X,
         handler: 'index.handler',
         code: lambda.Code.fromAsset('lambda/admin-service'),
         timeout: cdk.Duration.seconds(30),
         environment: {
            JWT_SECRET_KEY: env.JWT_SECRET_KEY,
            JWT_EXPIRES_IN: env.JWT_EXPIRES_IN,
            PROJECT_NAME: 'Rentte-user',
            IS_SECURE_SWAGGER: 'false',
            DB_HOST: env.DB_HOST,
            DB_PASSWORD: env.DB_PASSWORD,
            DB_USER: env.DB_USER,
            DB_NAME: env.DB_NAME,
            DB_PORT: env.DB_PORT,
            AWS_BUCKET_NAME: env.AWS_BUCKET_NAME,
            ID_S3: env.ID_S3,
            KEY_S3: env.KEY_S3,
            ADMIN_RESET_PASSWORD_URL: env.ADMIN_RESET_PASSWORD_URL,
            PRODUCTION: 'true',
            LOGGING_ENABLED: 'true',
            NODE_ENV: 'development',
            SERVICE_NAME: 'rentte-admin',
            AWS_SES_SENDER: env.AWS_SES_SENDER,
            RENTTE_IMAGE_URL: env.RENTTE_IMAGE_URL,
            SMTP_USER: env.SMTP_USER,
            SMTP_PASS: env.SMTP_PASS,
            SMTP_HOST: env.SMTP_HOST,
            SMTP_PORT: env.SMTP_PORT,
            QUEUE_URL: env.QUEUE_URL,
            AWS_S3_BUCKET_BASE_URL: env.AWS_S3_BUCKET_BASE_URL,

         },
         memorySize: 512,
      });

      adminService.role.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSNSFullAccess'));
      adminService.role.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'));

      new apigateway.LambdaRestApi(this, 'adminApi', {
         restApiName: 'admin-service',
         description: 'This service serves adminService Lambda function.',
         handler: adminService,
         proxy: true,
         binaryMediaTypes: ['image/jpeg', 'image/png', 'image/jpg', '*/*', 'multipart/form-data'],

      });

      apiGatewayRole.addToPolicy(new iam.PolicyStatement({
         resources: [adminService.functionArn],
         actions: ['lambda:InvokeFunction'],
      }));

      const productService = new lambda.Function(this, 'productService', {
         runtime: lambda.Runtime.NODEJS_20_X,
         handler: 'index.handler',
         code: lambda.Code.fromAsset('lambda/product-service'),
         timeout: cdk.Duration.seconds(120),
         memorySize: 512,
         environment: {
            JWT_SECRET_KEY: env.JWT_SECRET_KEY,
            JWT_EXPIRES_IN: env.JWT_EXPIRES_IN,
            PROJECT_NAME: 'Rentte-user',
            IS_SECURE_SWAGGER: 'false',
            DB_HOST: env.DB_HOST,
            DB_PASSWORD: env.DB_PASSWORD,
            DB_USER: env.DB_USER,
            DB_NAME: env.DB_NAME,
            DB_PORT: env.DB_PORT,
            AWS_BUCKET_NAME: env.AWS_BUCKET_NAME,
            ID_S3: env.ID_S3,
            KEY_S3: env.KEY_S3,
            PRODUCTION: 'true',
            LOGGING_ENABLED: 'true',
            NODE_ENV: 'development',
            SERVICE_NAME: 'rentte-product',
            AWS_SES_SENDER: env.AWS_SES_SENDER,
         },
      });

      productService.role.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonS3FullAccess'));
      productService.role.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'));

      new apigateway.LambdaRestApi(this, 'productApi', {
         restApiName: 'product-service',
         description: 'This service serves productService Lambda function.',
         handler: productService,
         proxy: true,
         binaryMediaTypes: ['image/jpeg', 'image/png', 'image/jpg', '*/*', 'multipart/form-data'],
      });

      apiGatewayRole.addToPolicy(new iam.PolicyStatement({
         resources: [productService.functionArn],
         actions: ['lambda:InvokeFunction'],
      }));
      const emailQueue = new sqs.Queue(this, 'EmailQueue', {
         queueName: 'BulkEmailQueue',
         visibilityTimeout: cdk.Duration.seconds(1),
         retentionPeriod: cdk.Duration.days(4),
      });
    
      const emailService = new lambda.Function(this, 'emailService', {
         runtime: lambda.Runtime.NODEJS_20_X,
         handler: 'index.handler',
         code: lambda.Code.fromAsset('lambda/email-service'),
         timeout: cdk.Duration.seconds(60),
         memorySize: 512,
         environment: {
            QUEUE_URL: emailQueue.queueUrl,
            JWT_SECRET_KEY: env.JWT_SECRET_KEY,
            JWT_EXPIRES_IN: env.JWT_EXPIRES_IN,
            PROJECT_NAME: 'Rentte-user',
            IS_SECURE_SWAGGER: 'false',
            DB_HOST: env.DB_HOST,
            DB_PASSWORD: env.DB_PASSWORD,
            DB_USER: env.DB_USER,
            DB_NAME: env.DB_NAME,
            DB_PORT: env.DB_PORT,
            AWS_BUCKET_NAME: env.AWS_BUCKET_NAME,
            ID_S3: env.ID_S3,
            KEY_S3: env.KEY_S3,
            PRODUCTION: 'true',
            LOGGING_ENABLED: 'true',
            NODE_ENV: 'development',
            SERVICE_NAME: 'rentte-email-service',
            AWS_SES_SENDER: env.AWS_SES_SENDER,
            SMTP_PASS: env.SMTP_PASS,
            SMTP_USER: env.SMTP_USER,
            SMTP_HOST: env.SMTP_HOST,
            SMTP_PORT: env.SMTP_PORT,
            EMAIL_SERVICE_API_URL: env.EMAIL_SERVICE_API_URL,
            UNSUBSCRIBE_EMAIL_TEMPLATE: env.UNSUBSCRIBE_EMAIL_TEMPLATE,
            
         },
      });

      emailQueue.grantConsumeMessages(emailService);
      emailService.role.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSESFullAccess'));
      emailService.role.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'));
      emailService.role.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSQSFullAccess'));
      emailService.addEventSource(new lambdaEventSources.SqsEventSource(emailQueue, { batchSize: 10 }));
      
      new apigateway.LambdaRestApi(this, 'emailApi',{
         restApiName: 'email-service',
         description: 'This service serves emailService Lambda function.',
         handler: emailService,
         proxy: true,
      });

      apiGatewayRole.addToPolicy(new iam.PolicyStatement({
         resources: [emailService.functionArn],
         actions: ['lambda:InvokeFunction'],
      }));
      
      const blogService = new lambda.Function(this, 'blogService', {
         runtime: lambda.Runtime.NODEJS_20_X,
         handler: 'index.handler',
         code: lambda.Code.fromAsset('lambda/blogs-service'),
         timeout: cdk.Duration.seconds(120),
         memorySize: 512,
         environment: {
            JWT_SECRET_KEY: env.JWT_SECRET_KEY,
            JWT_EXPIRES_IN: env.JWT_EXPIRES_IN,
            PROJECT_NAME: 'Rentte-user',
            IS_SECURE_SWAGGER: 'false',
            DB_HOST: env.DB_HOST,
            DB_PASSWORD: env.DB_PASSWORD,
            DB_USER: env.DB_USER,
            DB_NAME: env.DB_NAME,
            DB_PORT: env.DB_PORT,
            AWS_BUCKET_NAME: env.AWS_BUCKET_NAME,
            ID_S3: env.ID_S3,
            KEY_S3: env.KEY_S3,
            PRODUCTION: 'true',
            LOGGING_ENABLED: 'true',
            NODE_ENV: 'development',
            SERVICE_NAME: 'rentte-blog',
            AWS_SES_SENDER: env.AWS_SES_SENDER,
            AWS_BUCKET_BLOG: env.AWS_BUCKET_BLOG,
         },
      });
      blogService.role.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonS3FullAccess'));
      blogService.role.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'));

      new apigateway.LambdaRestApi(this, 'blogApi', {
         restApiName: 'blog-service',
         description: 'This service serves blogService Lambda function.',
         handler: blogService,
         proxy: true,
         binaryMediaTypes: ['image/jpeg', 'image/png', 'image/jpg', '*/*', 'multipart/form-data'],
      });

      apiGatewayRole.addToPolicy(new iam.PolicyStatement({
         resources: [blogService.functionArn],
         actions: ['lambda:InvokeFunction'],
      }));
 
   }
}

module.exports = { AppStack };
