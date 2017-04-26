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

'use strict';

const TJBot = require('../tjbot-striplight');

// these are the hardware capabilities that TJ needs for this recipe
var hardware = ['led-strip'];

// turn on debug logging to the console
var tjConfig = {
    log: {
        level: 'debug'
    },
    shine: {
        led_strip: {
            num_leds: 180
        }
    }
};

// instantiate our TJBot!
var tj = new TJBot(hardware, tjConfig, {});
tj._setupLEDStrip();
console.log("TJBot configured with " + tj.configuration.shine.led_strip.num_leds + " LEDs");

var numLEDs = tj.configuration.shine.led_strip.num_leds;

for (var i = 0; i < numLEDs; i++) {
    tj.shineLED(i, "red");
    tj.sleep(50);
}

for (var i = numLEDs - 1; i >= 0; i--) {
    tj.shineLED(i, "green");
    tj.sleep(50);
}

for (var i = 0; i < numLEDs; i++) {
    tj.shineLED(i, "blue");
    tj.sleep(50);
}

tj.rainbowStrip();
tj.sleep(3000);

tj.shineStripWithRGBColor("off");
