@"
# API Contracts

Base URL: http://localhost:5000/api

## Auth

### POST /auth/register
Request:
{ ""name"": ""Ananya"", ""email"": ""a@b.com"", ""password"": ""secret123"", ""role"": ""TOURIST"" }

Response 201:
{ ""success"": true, ""data"": { ""id"": 1, ""name"": ""Ananya"", ""email"": ""a@b.com"", ""role"": ""TOURIST"" } }

### POST /auth/login
Request:
{ ""email"": ""a@b.com"", ""password"": ""secret123"" }

Response 200:
{ ""success"": true, ""data"": { ""token"": ""jwt..."", ""user"": { ""id"": 1, ""role"": ""TOURIST"" } } }

### GET /auth/me
Headers: Authorization: Bearer <token>
Response 200:
{ ""success"": true, ""data"": { ""id"": 1, ""name"": ""Ananya"", ""role"": ""TOURIST"" } }
"@ | Out-File -FilePath API.md -Encoding utf8