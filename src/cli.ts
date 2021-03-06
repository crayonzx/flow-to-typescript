#!/usr/bin/env node

import minimist = require('minimist')
import { readFile, writeFile } from 'mz/fs'
import { resolve } from 'path'
import stdin = require('stdin')
import { compile } from './index'

main(minimist(process.argv.slice(2), {
  alias: {
    help: ['h'],
    input: ['i'],
    output: ['o']
  }
}))

async function main(argv: minimist.ParsedArgs) {

  if (argv.help) {
    printHelp()
    process.exit(0)
  }

  const argIn: string = argv._[0] || argv.input
  const argOut: string = argv._[1] || argv.output

  try {
    const flow = await readInput(argIn)
    const ts = await compile(flow, argIn)
    await writeOutput(ts, argOut)
  } catch (e) {
    process.stderr.write(e.message)
    process.exit(1)
  }

}

function readInput(argIn?: string) {
  if (!argIn) {
    return new Promise<string>(stdin)
  }
  return readFile(resolve(process.cwd(), argIn), 'utf-8')
}

function writeOutput(ts: string, argOut: string): Promise<void> {
  if (!argOut) {
    try {
      process.stdout.write(ts)
      return Promise.resolve()
    } catch (err) {
      return Promise.reject(err)
    }
  }
  return writeFile(argOut, ts)
}

function printHelp() {
  const pkg = require('../../package.json')

  process.stdout.write(
`
${pkg.name} ${pkg.version}
Usage: flow2ts [--input, -i] [IN_FILE] [--output, -o] [OUT_FILE]

With no IN_FILE, or when IN_FILE is -, read standard input.
With no OUT_FILE and when IN_FILE is specified, create .ts file in the same directory.
With no OUT_FILE nor IN_FILE, write to standard output.
`
  )
}
