# tjbot-striplight

> Adds support for a NeoPixel RGB LED strip light to TJBot

This is an extension of the [TJBot library](http://github.com/ibmtjbot/tjbotlib) that adds support for a NeoPixel RGB LED strip light.

# Usage

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

# New API Methods

### tj.shineStrip(rgbColors)

Shines the LED strip with the given `Uint32Array` of colors.

### tj.rainbowStrip(offset)

Shines the LED strip with a rainbow pattern, starting with the given `offset`. An `offset` of 0 will begin the rainbow at the first LED. An `offset` of 5 will begin the rainbow at the 5th LED.

### tj.shineStripWithRGBColor(color)

Shines all LEDs in the strip the given RGB color. This color must be interpretable by `tj._normalizeColor()`, which means named colors (e.g. “red”, “blue”, “orange”) and colors specified in hexadecimal (e.g. “#F2A7C1”) are valid options.

### tj.shineStripWithHSLColor(h, s, l)

Shines all LEDs in the strip the given HSL color. Saturation and lightness values of 0.5 seem to work well for the NeoPixel LEDs.

# Contributing
We encourage you to make enhancements to this library and contribute them back to us via a pull request.

# License
This project uses the [Apache License Version 2.0](LICENSE) software license.
