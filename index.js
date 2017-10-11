'use strict'

/*
 * cli-step
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const Spinner = require('cli-spinner').Spinner
const colors = require('colors')
const nodeEmoji = require('node-emoji')

/**
 * A spinner that prints the message without a spinner. This
 * is have a unified API over writing bunch of if/else
 * statements.
 *
 * @class SpinnerWithoutSpinner
 */
class SpinnerWithoutSpinner extends Spinner {
  constructor (text) {
    super({
      text,
      onTick: function (message) {
        this.clearLine(this.stream)
        this.stream.write(message.trim())
      }
    })
  }

  setSpinnerString () {
    super.setSpinnerString(' ')
  }
}

/**
 * Step class prints a new line on the terminal with a
 * spinner, step position, emoji and a help text.
 *
 * You must get the instance of this class by calling the
 * `proceed` method on StepsJar.
 *
 * @class Step
 *
 * @param {Number} position
 * @param {Number} total
 * @param {String} initialText
 * @param {String} [emojiName]
 * @param {String} [helpLabel]
 */
class Step {
  constructor (position, total, initalText, useSpinner, emojiName, helpLabel) {
    this.position = position
    this.total = total
    this.initalText = initalText
    this.emojiName = emojiName
    this.helpLabel = helpLabel
    this.spinner = useSpinner ? new Spinner(this._makeMessage()) : new SpinnerWithoutSpinner(this._makeMessage())
    this.setSpinner(18)
  }

  /**
   * Makes a proper message string by using all
   * required and optional properties
   *
   * @method _makeMessage
   *
   * @return {String}
   *
   * @private
   */
  _makeMessage () {
    const step = colors.dim(`[${this.position}/${this.total}]`)
    const emoji = this.emojiName ? ` ${nodeEmoji.get(this.emojiName)} ` : ''
    const message = ` ${this.initalText}`
    const prefix = this.helpLabel ? ` ${colors.dim(`[${this.helpLabel}]`)}` : ''
    return `${step}${emoji}${message}${prefix}`
  }

  /**
   * Prints a message on the console, based upon whether
   * spinner is running or not and whether spinner was
   * disabled or not
   *
   * @method _print
   *
   * @param  {String} message
   *
   * @return {void}
   *
   * @private
   */
  _print (message) {
    if (this.spinner.isSpinning()) {
      this.spinner.setSpinnerTitle(this._makeMessage())
    } else if (this.spinner instanceof SpinnerWithoutSpinner) {
      console.log(message)
    } else {
      console.log(`  ${message}`)
    }
  }

  /**
   * Update the spinner by defining the spinner index
   * or a string that can be animated.
   *
   * List of spinners here https://goo.gl/zyrvjT
   *
   * @method setSpinner
   *
   * @param  {Number|String}   value
   *
   * @chainable
   */
  setSpinner (value) {
    this.spinner.setSpinnerString(value)
    return this
  }

  /**
   * Start the spinner whenever you
   * want
   *
   * @method start
   *
   * @chainable
   */
  start () {
    this.spinner.start()
    return this
  }

  /**
   * Update the step message body
   *
   * @method update
   *
   * @param  {String} message
   *
   * @chainable
   */
  update (message) {
    this.initalText = message
    this._print(this._makeMessage())
    return this
  }

  /**
   * Just stop the spinner
   *
   * @method stop
   *
   * @return {void}
   */
  stop () {
    this.spinner.stop(true)
    this._print(this._makeMessage())
  }

  /**
   * Mark step as successfull
   *
   * @method success
   *
   * @param  {String} message
   * @param  {String} [emojiName]
   *
   * @return {void}
   */
  success (message, emojiName) {
    /**
     * Update text if new text if passed
     */
    this.initalText = message || this.initalText

    /**
     * Update emoji name if passed
     */
    this.emojiName = emojiName || this.emojiName

    /**
     * Stop the spinner
     */
    this.stop()
  }

  /**
   * Mark step as failed
   *
   * @method error
   *
   * @param  {String} message
   * @param  {String} [emojiName]
   *
   * @return {void}
   */
  error (message, emojiName) {
    /**
     * Update text if new text if passed
     */
    this.initalText = message || this.initalText

    /**
     * Update emoji name if passed
     */
    this.emojiName = emojiName || 'x'

    /**
     * Stop the spinner
     */
    this.stop()
  }
}

/**
 * StepsJar let you print steps by incrementing
 * a number in each call to `proceed` method.
 *
 * @class StepsJar
 *
 * @param {Number} total
 */
class StepsJar {
  constructor (total, disableSpinner) {
    if (!total || isNaN(Number(total))) {
      throw new Error('Define total number of steps as an integer')
    }

    /**
     * Steps
     */
    this.total = Number(total)
    this.currentStep = 0

    /**
     * Time tracking
     *
     * @type {Object}
     */
    this.tracker = {
      start: null,
      stop: null
    }

    /**
     * Using a global spinner or not
     */
    this.disableSpinner = !!disableSpinner
  }

  /**
   * Start recording the time
   *
   * @method startRecording
   *
   * @chainable
   */
  startRecording () {
    this.tracker.start = process.hrtime()
    return this
  }

  /**
   * End time recording for steps
   *
   * @method stopRecording
   *
   * @return {Number}   Time in nanoseconds
   */
  stopRecording () {
    if (!this.tracker.start) {
      throw new Error('Make sure to call startRecording before endTracking')
    }

    this.tracker.stop = process.hrtime(this.tracker.start)
    return this.tracker.stop[0] * 1e9 + this.tracker.stop[1]
  }

  /**
   * Increment the step by one. This method returns
   * the instance of `Step` class
   *
   * @method advance
   *
   * @param  {String} message
   * @param  {String} [emojiName]
   * @param  {String} [helpLabel]
   *
   * @return {Step}
   */
  advance (message, emojiName, helpLabel) {
    this.currentStep++
    if (this.globalSpinner && !this.globalSpinner.isSpinning()) {
      console.log('')
      this.globalSpinner.setSpinnerString(18)
      this.globalSpinner.start()
    }

    return new Step(this.currentStep, this.total, message, !this.disableSpinner, emojiName, helpLabel)
  }
}

module.exports = StepsJar
module.exports.Step = Step
