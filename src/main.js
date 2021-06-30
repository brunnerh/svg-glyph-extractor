#!/usr/bin/env node

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

if (process.argv.length < 3)
{
	console.log('Usage: svg-glyph-extractor <input-svg-path>');
	console.log('The file has to be UTF-8 encoded.');
	process.exit(1);
}

const inputPath = process.argv[2];
main().catch(r =>
{
	console.error(r);
	process.exit(2);
});

async function main()
{
	const browser = await puppeteer.launch();
	const page = await browser.newPage();
	const svg = fs.readFileSync(inputPath, { encoding: 'utf-8' });
	
	const { dir: outputDirectory, name: prefix } = path.parse(inputPath);
	
	const svgs = await page.evaluate(generateSvgs, svg, prefix);
	console.log(`${svgs.length} glyphs found.`);
	
	for (const svg of svgs)
	{
		try
		{
			const outputPath = path.join(outputDirectory, svg.outputName);
			console.log(`Writing glyph ${svg.unicode} to ${outputPath}...`);
			fs.writeFileSync(outputPath, svg.content, { flag: 'wx' });
		}
		catch (error)
		{
			console.log('Failed to write file: ', error);
		}
	}

	await browser.close();
}

function generateSvgs(text, prefix)
{
	const parser = new DOMParser();
	const svgDocument = parser.parseFromString(text, 'text/xml');

	const glyphs = [...svgDocument.querySelectorAll('glyph')];

	const svgs = glyphs.map(glyph =>
	{
		const glyphName = glyph.getAttribute('glyph-name');
		const unicode = glyph.getAttribute('unicode');
		const code = unicode.codePointAt(0);

		const name = glyphName ?? `0x${code.toString(16)}`;
		const data = glyph.getAttribute('d');

		const glyphDocumentMarkup = makeSvg(data);

		const pathSvg = parser.parseFromString(glyphDocumentMarkup, 'text/xml');
		const pathElement = pathSvg.querySelector('path');

		document.body.appendChild(pathSvg.documentElement);
		const { width, height, x, y } = pathElement.getBBox();

		const padding = 0.05;
		const contentLength = Math.max(width, height);
		const paddingLength = contentLength * padding;
		const boxLength = contentLength + 2 * paddingLength;

		const offset = {
			x: (boxLength - width) / 2 - x,
			y: (boxLength - height) / 2 - y,
		};

		const content = makeSvg(data, boxLength, offset);
		const outputName = `${prefix}-${name}.svg`;

		return {
			unicode,
			outputName,
			content,
		};
	});

	return svgs;

	function makeSvg(pathData, size = null, offset = null)
	{
		const viewBox = size == null ? '' : `viewBox="0 0 ${size} ${size}"`;
		const transform = offset == null ? '' : `transform="translate(${offset.x} ${offset.y})"`;

		return '<?xml version="1.0" ?>\n' +
			`<svg xmlns="http://www.w3.org/2000/svg" version="1.1" ${viewBox}><path ${transform} d="${pathData}"/></svg>`;
	}
}