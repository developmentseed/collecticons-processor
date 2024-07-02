[![collecticons-banner](https://cloud.githubusercontent.com/assets/1090606/8695447/fdef92fa-2adc-11e5-8979-b61bd96d24ca.png)](https://collecticons.io)

# Collecticons processor [![CircleCI](https://circleci.com/gh/developmentseed/collecticons-processor.svg?style=svg)](https://circleci.com/gh/developmentseed/collecticons-processor)
> Processor script for [collecticons icon library](https://github.com/developmentseed/collecticons-lib).

This utility is meant to be used to generate webfont (woff, woff2) and style files (css, sass) from the [collecticons icon library](https://github.com/developmentseed/collecticons-lib).

Install the module as a global dependency.
```
npm install -g collecticons-processor
```

## Usage
The script has 2 commands explained below.
```
$ collecticons
  Usage: collecticons [options] [command]

  Options:
    -v, --verbose                              increase verbosity
    --quiet                                    disable all output
    -V, --version                              output the version number
    -h, --help                                 output usage information

  Commands:
    compile [options] <source-folder>          Compile the font from svg icons
    bundle <source-folder> <destination-file>  Compile the font outputting a zip file. Contains all the used icons, stylesheet and preview.
```

### Compile
Compiles the font and the style files.
```
$ collecticons compile --help
  Usage: compile [options] <source-folder>

  Compile the font from svg icons

  Options:

  --font-name <name>              name of the font (default: "collecticons")
  --font-types <val>              font types to output (woff,woff2) (default: ["woff2"])
  --font-dest <val>               outputs font files to given destination. Output disabled by default. Using this disables font embed
  --author-name <val>             name of the author
  --author-url <val>              url of the author
  --class-name <name>             class name to use (default: "collecticon")
  --style-name <name>             name for for the style file (default: "icons")
  --style-formats <val>           style formats to output (sass,css) (default: ["sass"])
  --style-dest <val>              destination folder for the style files (default: "collecticons/styles/")
  --no-sass-placeholder           disable the sass placeholder
  --no-css-class                  disable the css standalone classes
  --preview-dest <dest>           destination folder for the preview (default: "collecticons/")
  --no-preview                    disable the preview
  --rescale                       normalize icons by scaling them to the height of the highest icon
  --catalog-dest <dest>           destination folder for the catalog. Output disable by default
  --experimental-font-on-catalog  includes the base64 string of the fonts on the catalog. Experimental feature, may change at anytime
  --experimental-disable-styles   disabled the style output. Experimental feature, may change at anytime
  -h, --help                      output usage information

```
By default everything will be output to a `collecticons/` folder. It includes a sass file with an embedded woff2 font and a preview to view the exported icons.
```
$ collecticons compile source/
```
Result:
```
collecticons/
  - styles/
    - icons.scss
  - preview.html
```

It is possible to change all the paths through options:
```
$ collecticons compile source/ --no-preview --style-dest assets/styles
```

#### Font embed
By default the sass/css files will have an embedded woff2 font. This can be disabled and use font files instead with the `--font-dest <dest>` parameter. This parameter expects a destination where to store the fonts. The font inclusion in the css file will point to this path.

```
$ collecticons compile source/ --no-preview --style-dest assets/styles --font-dest assets/fonts
```

#### Font types
The `--font-types` flag allows you to limit the output formats to particular types. Only `woff` and `woff2` are supported.

```
$ collecticons compile source/ --font-types woff2,woff
```

#### SASS vs CSS
The script can output both `sass` and `css` formats but they have significant differences in the way they are structured.
By default only the `sass` file is created, but this can be changed with `--style-formats`:

```
$ collecticons compile source/ --style-formats sass,css
```

#### SASS placeholders vs CSS classes
When outputting the style in `sass` format, the script will by default include both sass placeholders and css classes. The output can be modified with `--no-sass-placeholder` and `--no-css-class`. Important to note that they can't both be disabled, and these flags are not valid for `css` output.

**SASS**

```scss
%collecticon,
[class^="collecticon-"],
[class*=" collecticon-"] {
  font-family: "collecticons";
  // ...
}

.collecticon-add:before {
  content: "\EA01"
}

%collecticon-add {
  @extend %collecticon;
  content: "\EA01"
}
```
Placeholders don't make any assumption to what pseudo selector is used (`before` or `after`) therefore some semantic styling is required.

```html
<button class="bttn-add">Add</button>
```

```scss
.bttn-add:before { // or .bttn-add:after {
  @extend %collecticon-add;
}
```
Using this approach allows the usage of up to two icons per element (one per selector).

**CSS**

```css
[class^="collecticon-"],
[class*=" collecticon-"] {
  font-family: "collecticons";
  /* ... */
}

.collecticon-add:before {
  content: "\EA01"
}
```

You can place Collecticons just about anywhere using the respective CSS class. The icon library is designed to be used with inline elements (we like the `<i>` tag for brevity, but using a `<span>` is more semantically correct).

```html
<button><i class="collecticon-add"></i> Add</button>
```

### Bundle
Creates a zip file with the fonts, css styles, and the icons. *Used to prepare the library for distribution.*
```
$ collecticons bundle -h
  Usage: bundle [options] <source-folder> <destination-file>

  Compile the font outputting a zip file. Contains all the used icons, stylesheet and preview.

  Options:
    -h, --help  output usage information
```
Example:
```
$ collecticons bundle source/ destination.zip
```

------

## Programmatic API
Both collecticons functions can be used programmatically.
```
const { compile, bundle } = require('../src');
```

### compile(params)
Compiles the collecticons font and associated styles, catalog and preview files.

**params.dirPath**  
Source path for the svg icons.

**params.fontName**  
Font name. Default: `collecticons`

**params.fontTypes**  
List of fonts to create. Default to `[woff2]`. Possible values `[woff, woff2]`

**params.fontDest**  
If defined has to be a valid folder path and fonts will be output instead of embedded. Default `undefined`.

**params.authorName**  
Author name for meta information. Default `Development Seed`

**params.authorUrl**  
Author url for meta information. Default `https://developmentseed.org/`

**params.className**  
Class name for SASS and CSS files. Default `collecticons`

**params.styleName**  
Style file name. `scss` and `css` extensions will be using according to the generated file. Default `icons`

**params.styleFormats**  
List of style files to create. Default to `[sass]`. Possible values `[css, sass]`

**params.styleDest**  
Output destination for the style files. Default `collecticons/styles/`

**params.sassPlaceholder**  
Whether or not to render sass placeholders. Only valid for sass style. Default `true`

**params.cssClass**  
Whether or not to render css classes. Default `true`

**params.previewDest**  
Output destination for the preview file. Default `collecticons/`

**params.preview**  
Whether or not to render the preview file. Default `true`

**params.rescale**  
Whether or not to normalize icons by scaling them to the height of the highest icon. Default `false`

**params.catalogDest**  
If defined has to be a valid folder path and catalog will be output. Default `undefined`.

**params.noFileOutput**  
If set to `true` a list of files and their content is returned instead of writing the files to disk. Default `undefined`.

**params.experimentalFontOnCatalog**
Includes the base64 string of the fonts on the catalog. Default `undefined`.
Experimental feature, may change at anytime.

**params.experimentalDisableStyles**
Disables the output of the style files. Default `undefined`.
Experimental feature, may change at anytime.

### bundle(params)
Compiles the collecticons font and zips it. Contains all the used icons, stylesheet and preview.

**params.dirPath**  
Source path for the SVG icons.

**params.destFile**  
Destination of the zip file.

## Contributing
You are free to contribute to the project. If you find a bug and/or have a nice idea about a feature feel free to open an issue or submit your own solution. See [DEVELOPMENT.md](DEVELOPMENT.md) for setup instructions.
We'll be more than happy to hear your suggestions. :)

## License
Collecticons is licensed under **The MIT License (MIT)**, see the [LICENSE](LICENSE) file for more details.
