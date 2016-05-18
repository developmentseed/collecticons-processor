[![collecticons-banner](https://cloud.githubusercontent.com/assets/1090606/8695447/fdef92fa-2adc-11e5-8979-b61bd96d24ca.png)](https://collecticons.io)

# Collecticons processor [![Build Status](https://travis-ci.org/developmentseed/collecticons-processor.svg?branch=master)](https://travis-ci.org/developmentseed/collecticons-processor)
> Processor script for [collecticon icon library](https://github.com/developmentseed/collecticons-lib).

This utility is meant to be used to generate webfont (eot, woff, ttf) and style files (css, sass) from the [collecticon icon library](https://github.com/developmentseed/collecticons-lib).

Install the module as a global dependency.
```
npm install -g collecticons-processor
```

## Usage
The script has 3 commands explained below.
```
$ collecticons
  Usage: collecticons [options] [command]


  Commands:

    compile [options] <source-folder>                    Compile the font from svg icons
    grid [options] <source-folder> <destination-folder>  Alter the icons grid
    bundle <source-folder> <destination-file>            Compile the font outputting a zip file.

  Options:

    -h, --help     output usage information
    -V, --version  output the version number
```

### Compile
Compiles the font and the style files.
```
$ collecticons compile --help
  Usage: compile [options] <source-folder>

  Compile the font from svg icons

  Options:

    -h, --help             output usage information
    --font-name <name>     name of the font
    --font-types <dest>    font types to output (ttf,woff,eot) [ttf,woff,eot]
    --font-dest <dest>     destination folder for the font
    --font-embed           embed the font in the css (except eot). When embedding, the font files are removed
    --author-name <dest>   name of the author
    --author-url <dest>    url of the author
    --class-name <name>    class name to use
    --style-format <dest>  style formats to output (sass,css) [sass]
    --style-dest <dest>    destination folder for the style files
    --style-name <name>    name for for the style files
    --no-placeholder       disable the sass placeholder
    --no-standalone        disable the css standalone classes
    --preview-dest <dest>  destination folder for the preview
    --no-preview           disable the preview
    --catalog-dest <dest>  destination folder for the catalog. Output disable by default

```
By default everything will be output to a `collecticons/` folder. It includes a sass file, all the fonts and a preview to view the exported icons.
```
$ collecticons compile source/
```
Result:
```
collecticons/
  - styles/
    - _icons.scss
  - preview.html
  - font/
    - collecticons.woff
    - collecticons.ttf
    - collecticons.eot
```

It is possible to change all the paths through options:
```
$ collecticons compile source/ --no-preview --font-dest assets/fonts --style-dest assets/styles
```

#### Font embed
If you're working with modern browsers and just want to embed the font in the sass file you can use the `--font-embed` flag.
> Note: You can use `--font-types none` to ensure that no additional fonts are output.

```
$ collecticons compile source/ --no-preview --style-dest assets/styles --font-types none --font-embed
```

#### Sass vs Css
The script can output both `sass` and `css` formats but they have significant differences in the way they are structured.

**css**
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
<button><i class="ocollecticon-add"></i> Add</button>
```

**sass**

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
By default the `scss` also outputs the normal css classes so that icons can be used directly on an html element (see above) but this can be disabled.

```html
<button class="bttn-add">Add</button>
```

```scss
.bttn-add:before { // or .bttn-add:after {
  @extend %collecticon-add;
}
```
Using this approach allows the usage of up to two icons per element (one per selector).

### Grid
The svg icons have a grid that's used to aid development and that has to be removed if they're to be used in raw format.
```
$ collecticons grid -r source/ dest/
```

### Bundle
Creates a zip file with the fonts, css styles, and a gridless version of the icons. *Used to prepare the library for distribution.*
```
$ collecticons bundle source/ destination.zip
```

## Testing
The testing is done using mocha. Use `npm test` to run the tests.

## Contributing
You are free to contribute to the project. If you find a bug and/or have a nice idea about a feature feel free to open an issue or submit your own solution. We'll be more than happy to hear your suggestions. :)

## License
Collecticons is licensed under **The MIT License (MIT)**, see the [LICENSE](LICENSE) file for more details.
