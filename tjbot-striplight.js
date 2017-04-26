/**
 * Copyright 2017 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const TJBot = require('tjbot');
const winston = require('winston');

/** ------------------------------------------------------------------------ */
/** INTERNALS                                                                */
/** ------------------------------------------------------------------------ */

// overlay new hardware for the striplight
TJBot.prototype.hardware.push('led-strip');

TJBot.prototype.defaultConfiguration.shine = {
    led_strip: {
        num_leds: 60
    }
}

/** ------------------------------------------------------------------------ */
/** LED-STRIP                                                                */
/** ------------------------------------------------------------------------ */

/**
 * Set up the LED strip light. Must be called manually after calling the TJBot constructor.
 */
TJBot.prototype._setupLEDStrip = function() {
    // make sure the tjbot doesn't have an led already configured
    if (this._led != undefined) {
        throw new Error("TJBot doesn't support both an led and led-strip, please include only one in the hardware configuration.");
    }

    // set this winston instance's log level
    winston.level = this.configuration.log.level;

    winston.verbose("initializing LED strip with " + this.configuration.shine.led_strip.num_leds + " LEDs");
    var ws281x = require('rpi-ws281x-native');
    this._led = ws281x;
    this._led.init(this.configuration.shine.led_strip.num_leds);

    // keep track that we're using an led-strip
    this._ledstrip = true;

    // capture 'this' context
    var self = this;

    // clean up the led strip before the process exits
    process.on('SIGINT', function() {
        self._led.reset();
        process.nextTick(function() {
            process.exit(0);
        })
    });
}

/**
 * Assert that the TJBot is configured with an LED strip.
 */
TJBot.prototype._assertLEDStrip = function() {
    if (!this._ledstrip) {
        throw new Error(
            'TJBot is not configured with an led-strip. ' +
            'Please check that you included the "led-strip" hardware in the TJBot constructor.');
    }
}

/**
 * Convert a color from HSL space to RGB space.
 *
 * @param {Double} h The hue of the HSL color.
 * @param {Double} s The saturation of the HSL color.
 * @param {Double} l The lightness of the HSL color.
 */
TJBot.prototype._hslToRgb = function(h, s, l) {
    var r, g, b;
    
    if (s == 0) {
        r = g = b = l; // achromatic
    } else {
        var hue2rgb = function hue2rgb(p, q, t) {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        }
        
        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }
    
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

/**
 * Compute the rainbow colors.
 *
 * @param {Integer} offset The offset of the pattern; an offset of 0 begins at red and ends at blue, an offset will shift where the rainbow begins.
 */
TJBot.prototype._rainbowColors = function(offset = 0) {
    var numLED = this.configuration.shine.led_strip.num_leds;
    var hueStep = 1 / numLED;
    var colors = new Uint32Array(numLED);
    
    for (var i = 0; i < numLED; i++) {
        var h = i * hueStep;
        var s = 0.5;
        var l = 0.5;
        var rgb = this._hslToRgb(h, s, l);
        var rgbInt = rgb[0] << 0x10 | rgb[1] << 0x08 | rgb[2];
        colors[i] = rgbInt;
    }
    
    // rotate by offset
    for (var i = 0; i < offset; i++) {
        colors.unshift(colors.pop());
    }
    
    return colors;
}

/**
 * Shine the LED strip to the given colors.
 *
 * @param {Uint32Array} rgbColors The array of RGB colors.
 */
TJBot.prototype.shineStrip = function(rgbColors) {
    this._assertLEDStrip();
    
    if (!rgbColors.constructor === Uint32Array) {
        throw new Error("shineStrip() expects a Uint32Array of colors");
    }
    
    if (rgbColors.length != this.configuration.shine.led_strip.num_leds) {
        throw new Error(
            "shineStrip() expects an array with " + this.configuration.shine.led_strip.num_leds + 
            " colors, received an array with " + rgbColors.length + " colors.");
    }
    
    // map doesn't seem to be working for this, sigh
    var hexColors = [];
    for (var i = 0; i < rgbColors.length; i++) {
        hexColors[i] = rgbColors[i].toString(16);
    }

    // render
    winston.debug("TJBot shining LED strip to RGB ", hexColors);
    this._led.render(rgbColors);
}

/**
 * Shine the LED strip to a rainbow pattern, with a given offset.
 *
 * @param {Integer} offset The offset of the pattern; an offset of 0 begins at red and ends at blue, an offset will shift where the rainbow begins.
 */
TJBot.prototype.rainbowStrip = function(offset = 0) {
    this._assertLEDStrip();
    var colors = this._rainbowColors();
    this.shineStrip(colors);
}

/**
 * Shine the LED strip to a single RGB color.
 *
 * @param {String} color The color to use. Must be interpretable by TJBot.prototype._normalizeColor.
 */
TJBot.prototype.shineStripWithRGBColor = function(color) {
    this._assertLEDStrip();

    // convert to rgb
    var rgb = this._normalizeColor(color);
    var rgbInt = parseInt("0x" + rgb[1] + rgb[2] + rgb[3] + rgb[4] + rgb[5] + rgb[6]);

    // determine the LED colors
    var colors = new Uint32Array(this.configuration.shine.led_strip.num_leds);
    for (var i = 0; i < this.configuration.shine.led_strip.num_leds; i++) {
        colors[i] = parseInt(rgbInt);
    }
    
    // shine
    this.shineStrip(colors);
}

/**
 * Shine the LED strip to a single HSL color.
 *
 * @param {Double} h The hue of the HSL color.
 * @param {Double} s The saturation of the HSL color.
 * @param {Double} l The lightness of the HSL color.
 */
TJBot.prototype.shineStripWithHSLColor = function(h, s, l) {
    this._assertLEDStrip();

    // convert to rgb
    var rgb = this._hslToRgb(h, s, l);
    var rgbInt = rgb[0] << 0x10 | rgb[1] << 0x08 | rgb[2];
    
    // determine the LED colors
    var colors = new Uint32Array(this.configuration.shine.led_strip.num_leds);
    colors.fill(rgbInt);
    
    this.shineStrip(colors);
}

/**
 * Shine a single LED in the strip.
 * 
 * @param {Integer} index The index of the LED to shine. Must be less than the number of LEDs with which the strip was configured.
 * @param {String} color The color to use. Must be interpretable by TJBot.prototype._normalizeColor.
 */
TJBot.prototype.shineLED = function(index, color) {
    this._assertLEDStrip();
    
    // make sure the index is less than the number of LEDs in the strip
    if (index >= this.configuration.shine.led_strip.num_leds) {
        throw new Error("Cannot shine LED at index " + index + " when strip only contains " + this.configuration.shine.led_strip.num_leds + " LEDs");
    }
    
    // convert to rgb
    var rgb = this._normalizeColor(color);
    var rgbInt = parseInt("0x" + rgb[1] + rgb[2] + rgb[3] + rgb[4] + rgb[5] + rgb[6]);

    // determine the LED colors
    var colors = new Uint32Array(this.configuration.shine.led_strip.num_leds);
    for (var i = 0; i < this.configuration.shine.led_strip.num_leds; i++) {
        colors[i] = 0;
        if (i == index) {
            colors[i] = rgbInt;
        }
    }
    
    // shine
    this.shineStrip(colors);
}

module.exports = TJBot;
