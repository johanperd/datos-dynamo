provider "aws" {
  region = "us-east-2"
}

# IAM Role for Lambda Execution
resource "aws_iam_role" "lambda_exec_role_2" {
  name = "lambda_exec_role_2"

  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Action = "sts:AssumeRole",
      Effect = "Allow",
      Principal = {
        Service = "lambda.amazonaws.com"
      }
    }]
  })
}


resource "aws_iam_policy" "dynamodb_scan_policy" {
  name        = "dynamodb_scan_policy"
  description = "Permite realizar la acción dynamodb:Scan en la tabla datos"
  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Action = "dynamodb:Scan",
        Resource = "arn:aws:dynamodb:us-east-2:637423368026:table/datos"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "attach_dynamodb_scan_policy" {
  role       = aws_iam_role.lambda_exec_role_2.name
  policy_arn = aws_iam_policy.dynamodb_scan_policy.arn
}

resource "aws_iam_role_policy_attachment" "lambda_basic_execution" {
  role       = aws_iam_role.lambda_exec_role_2.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# Lambda Function
resource "aws_lambda_function" "datos-dynamo" {
  function_name = "datos-dynamo"
  runtime       = "nodejs20.x"
  handler       = "app.handler"  # Nombre del archivo y exportación del manejador
  role          = aws_iam_role.lambda_exec_role_2.arn
  filename      = "datos-dynamo.zip"

  source_code_hash = filebase64sha256("datos-dynamo.zip")
}

# API Gateway HTTP API
resource "aws_apigatewayv2_api" "api" {
  name          = "my-api"
  protocol_type  = "HTTP"
}

# API Gateway HTTP Integration
resource "aws_apigatewayv2_integration" "lambda_integration" {
  api_id          = aws_apigatewayv2_api.api.id
  integration_type = "AWS_PROXY"
  integration_uri  = "arn:aws:apigateway:us-east-2:lambda:path/2015-03-31/functions/${aws_lambda_function.datos-dynamo.arn}/invocations"
  payload_format_version = "2.0"
}

# API Gateway HTTP Route
resource "aws_apigatewayv2_route" "route" {
  api_id    = aws_apigatewayv2_api.api.id
  route_key = "ANY /{proxy+}"
  target    = "integrations/${aws_apigatewayv2_integration.lambda_integration.id}"
}

# API Gateway HTTP Stage
resource "aws_apigatewayv2_stage" "stage" {
  api_id     = aws_apigatewayv2_api.api.id
  name       = "$default"
  auto_deploy = true
}

# Lambda Permission for API Gateway
resource "aws_lambda_permission" "allow_apigateway" {
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.datos-dynamo.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.api.execution_arn}/*/*"
}

# Output API Gateway URL
output "api_url" {
  value = "${aws_apigatewayv2_api.api.api_endpoint}/${aws_apigatewayv2_stage.stage.name}"
}
