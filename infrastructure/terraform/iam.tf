# Roles IAM con AdministratorAccess (política excesivamente permisiva)

resource "aws_iam_role" "app_role" {
  name = "telcocore-app-role-${var.environment}"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "ec2.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "app_admin" {
  role       = aws_iam_role.app_role.name
  policy_arn = "arn:aws:iam::aws:policy/AdministratorAccess"
}

resource "aws_iam_instance_profile" "app" {
  name = "telcocore-instance-profile-${var.environment}"
  role = aws_iam_role.app_role.name
}

resource "aws_iam_role" "lambda_role" {
  name = "telcocore-lambda-role-${var.environment}"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "lambda.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_admin" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/AdministratorAccess"
}

output "app_role_arn"    { value = aws_iam_role.app_role.arn }
output "lambda_role_arn" { value = aws_iam_role.lambda_role.arn }
