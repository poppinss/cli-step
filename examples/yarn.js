'use strict'

const Steps = require('..')
const colors = require('colors')

const steps = new Steps(4)
let oldStep = null

/**
 * Start recording the time before processing
 * any step
 */
steps.startRecording()

setTimeout(() => {
  oldStep = steps.advance('Resolving packages...', 'mag').start()
}, 200)

setTimeout(() => {
  oldStep.stop()
  oldStep = steps.advance('Fetching packages...', 'truck').start()
}, 500)

setTimeout(() => {
  oldStep.stop()
  oldStep = steps.advance('Linking dependencies...', 'link').start()
}, 1000)

setTimeout(() => {
  oldStep.stop()
  oldStep = steps.advance('Building fresh packages...', 'package').start()
}, 1500)

setTimeout(() => {
  oldStep.stop()
  oldStep = null
  const nanoSecs = steps.stopRecording()
  console.log('')
  console.log(`  ${colors.green('success')} Saved lockfile`)
  console.log(`  ✨  Done in ${Math.round(nanoSecs / (1e9))}s.`)
}, 2000)

// YARN OUTPUT
// [1/4] 🔍  Resolving packages...
// [2/4] 🚚  Fetching packages...
// [3/4] 🔗  Linking dependencies...
// [4/4] 📃  Building fresh packages...
// success Saved lockfile.
// ✨  Done in 1.53s.
