# SVG Glyph Extractor

Extracts `glyph` Elements from an SVG into separate SVGs as `path` Elements.

The glyphs are centered in a square canvas with padding on all sides.

Example:

```xml
...
<glyph glyph-name="u10800" unicode="&#x10800;" horiz-adv-x="1396"
	d="M782 0h-168v525l-456 -456l-108 108l540 540l-540 540l108 108l456 -456v525h168v-525l456 456l108 -108l-540 -540l540 -540l-108 -108l-456 456v-525z" />
...
```

Gets converted into:

```xml
<?xml version="1.0" ?>
<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 1577.4 1577.4">
	<path transform="translate(90.70000000000005 71.70000000000005)"
		d="M782 0h-168v525l-456 -456l-108 108l540 540l-540 540l108 108l456 -456v525h168v-525l456 456l108 -108l-540 -540l540 -540l-108 -108l-456 456v-525z"/>
</svg>
```