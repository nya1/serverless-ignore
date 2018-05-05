### serverless-ignore

Serverless plugin to ignore files like a .gitignore

#### Install

`npm install --save-dev serverless-ignore`

#### Usage

Add `serverless-ignore` to your plugins list (serverless.yaml)

```
plugins:
  - serverless-ignore
  ...
```


Add a `.slsignore` in your root folder with a .gitignore-like syntax with all the files you want to ignore

```
node_modules/aws-sdk/*
README.md
*.log
.env.example
.git/*
__tests__/*
```

