# tjbot-striplight

> Adds support for a NeoPixel RGB LED strip light to TJBot

This is an extension of the [TJBot library](http://github.com/ibmtjbot/tjbotlib) that adds support for a NeoPixel RGB LED strip light.

# Usage

## Wiring

There are a number of guides for wiring an LED strip light to a Raspberry Pi. I recommend starting with the [Adafruit NeoPixel Überguide](https://learn.adafruit.com/adafruit-neopixel-uberguide) for a general overview of the NeoPixel LEDs. There is also a section that specifically focused on [wiring NeoPixel LEDs to a Raspberry Pi](https://learn.adafruit.com/adafruit-neopixel-uberguide/downloads?view=all#basic-connections).

This project was specifically developed to support NeoPixel strip lights, but may work with other kinds of NeoPixel products (e.g. rings).

Important notes to keep in mind when wiring your NeoPixel strip lights:

- **Wiring to the Pi**. My strip lights work when wired directly to my Pi 3 as follows: +5V on PIN 4, Gnd on PIN 9, Data on PIN 12/BCM 18. See [pinout.xyz](http://pinout.xyz) for a reference on Pi pin numbering.
- **Wiring to an external power supply**. Some guides recommend using an external 5V power supply for the strip lights. If using an external power supply, turn it on first before turning on the Pi. I wasn't able to get my strip lights working properly from an external source.
- **Connection order.** Always connect ground first and disconnect ground last.
- **Resistor**. It is recommended to use a 300-500 Ohm resistor on the data line. My strip lights only work without a resistor; placing any kind of resistor on the data line results in the lights flashing in random, unpredictable ways, or in some cases, only the first 30 LEDs were working (I tried different resistors from roughly 200 to 400 Ohm).

## Code

This is a drop-in replacement for the `tjbot` library.

First, clone this repository.

```
cd ~/Desktop
git clone https://github.com/jweisz/tjbot-striplight
```

Next, include this library in your recipe and instantiate the `TJBot` object with the `led-strip` hardware.

```
const TJBot = require('/home/pi/Desktop/tjbot-striplight');

var hardware = ['led-strip'];
var configuration = {
    shine: {
        led_strip: {
            num_leds: 60
        }
    }
};

var tj = new TJBot(hardware, configuration, {});
tj._setupLEDStrip();
```

> Note: TJBot does not support the simultaneous usage of an `led` and an `led-strip`. If TJBot is initialized with both pieces of hardware, it will throw an error.

> Note: You must call `tj._setupLEDStrip()` manually after constructing the TJBot object to initalize the new hardware.

## Testing

There is a test script in `test/test.striplight.js` you can use to test if your strip lights are working.

```
cd test
sudo node test.striplight.js
```

> Note: This script must be run as root in order to use the ws281x library to control the LEDs.

# New API Methods

### tj.shineStrip(rgbColors)

Shines the LED strip with the given `Uint32Array` of colors.

### tj.rainbowStrip(offset)

Shines the LED strip with a rainbow pattern, starting with the given `offset`. An `offset` of 0 will begin the rainbow at the first LED. An `offset` of 5 will begin the rainbow at the 5th LED.

### tj.shineStripWithRGBColor(color)

Shines all LEDs in the strip the given RGB color. This color must be interpretable by `tj._normalizeColor()`, which means named colors (e.g. “red”, “blue”, “orange”) and colors specified in hexadecimal (e.g. “#F2A7C1”) are valid options.

### tj.shineStripWithHSLColor(h, s, l)

Shines all LEDs in the strip the given HSL color. Saturation and lightness values of 0.5 seem to work well for the NeoPixel LEDs.

### tj.shineLED(index, color)

Shines the LED at the given index.

# Contributing
We encourage you to make enhancements to this library and contribute them back to us via a pull request.

# License
This project uses the [Apache License Version 2.0](LICENSE) software license.
