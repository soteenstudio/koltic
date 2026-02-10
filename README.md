# LightScript

![Build Status](https://github.com/soteenstudio/lightscript/actions/workflows/ci.yml/badge.svg)

[LightScript](www.example.com) is a programming language designed to be rigorous during compilation. It has a built-in compilation tool called the LightScript Compiler. LightScript itself is compiled into bytecode targeted for the [LightVM](https://github.com/soteenstudio/lightvm) virtual machine.
## Installation
For packages in NPM
```bash
# Install globally
npm install -g lightscript

# Install locally
npm install -D lightscript
```
For packages in Yarn
```bash
# Install globally
yarn global add lightscript

# Install locally
yarn add lightscript
```
## Get Started
Running a code
```bash
light --r main.lt
```
Compile a code
```bash
lcode -c main.lt
```
## Contribute
We have provided rules and standards for contributing to the LightScript project that you can follow to get started [contributing](CONTRIBUTING.md).