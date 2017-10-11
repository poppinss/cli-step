'use strict'

const Steps = require('..')
const colors = require('colors')

const steps = new Steps(3)
let oldStep = null

/**
 * Start recording the time before processing
 * any step
 */
steps.startRecording()

setTimeout(() => {
  oldStep = steps.advance('Linting', null, 'npm run lint').start()
}, 200)

setTimeout(() => {
  oldStep.success('Linting', 'white_check_mark')
  oldStep = steps.advance('Creating bundle', null, 'npm run build').start()
}, 800)

setTimeout(() => {
  oldStep.success('Bundled created', 'package')
  oldStep = steps.advance('Publishing to npm', null, 'npm publish').start()
}, 1400)

setTimeout(() => {
  oldStep.error('Cannot publish')
  oldStep = null
  console.log('')
  console.log(`  ${colors.red('npm: Cannot publish same or smaller version')}`)
}, 2000)
