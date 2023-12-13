# All the commands

## Install and configure Typescript

```bash
npm init

npm i -D typescript ts-node

npx typescript --init

npm i -S express
npm i -D @types/express

npm i -D nodemon
```

## ESLint

```bash
npx eslint --init
```

```bash
-How would you like to use ESLint?
To check syntax, find problems, and enforce code style.

What type of modules does your project use?
JavaScript modules (import/export)

Which framework does your project use?
None of these

Does your project use TypeScript?
Yes

Where does your code run?
Node

How would you like to define a style for your project?
Use a popular style guide

Which style guide do you want to follow?
AIRBNB

What format do you want your config file to be in?
JSON

Would you like to install them now with npm?
Yes
```

## Prettier & Husky

```bash
npm install — save-dev — save-exact prettier

npm i -D husky pretty-quick
```

## Jest

```bash
npm i -D jest @types/jest ts-jest

jest --init
```

```bash
Choose the test environment that will be used for testing
Node

Do you want Jest to add coverage reports?
No

Which provider should be used to instrument code for coverage?
Babel

Automatically clear mock calls and instances between every test?
Yes
```

// jest.config.js

```js
module.exports = {
  clearMocks: true,
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx'],
  roots: ['<rootDir>/src'],
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
};
```

## Supertest

```bash
npm i -D supertest @types/supertest
```
