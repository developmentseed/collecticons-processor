[![collecticons-banner](https://cloud.githubusercontent.com/assets/1090606/8695447/fdef92fa-2adc-11e5-8979-b61bd96d24ca.png)](https://collecticons.io)

# Collecticons processor
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


  Commands:

    compile [options] <source-folder>                    Compile the font from svg icons
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

  --font-name <name>     name of the font (default: "collecticons")
  --font-types <val>     font types to output (woff,woff2) (default: ["woff2"])
  --font-dest <val>      outputs font files to given destination. Output disabled by default. Using this disables font embed
  --author-name <val>    name of the author
  --author-url <val>     url of the author
  --class-name <name>    class name to use (default: "collecticon")
  --style-name <name>    name for for the style file (default: "icons")
  --style-formats <val>  style formats to output (sass,css) (default: ["sass"])
  --style-dest <val>     destination folder for the style files (default: "collecticons/styles/")
  --no-sass-placeholder  disable the sass placeholder
  --no-css-class         disable the css standalone classes
  --preview-dest <dest>  destination folder for the preview (default: "collecticons/")
  --no-preview           disable the preview
  --catalog-dest <dest>  destination folder for the catalog. Output disable by default
  -h, --help             output usage information

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

#### Sass vs Css
The script can output both `sass` and `css` formats but they have significant differences in the way they are structured.
By default only the `sass` file is created, but this can be changed with `--style-formats`:

```
$ collecticons compile source/ --style-formats sass,css
```

#### Sass placeholders vs Css classes
When outputting the style in `sass` format, the script will by default include both sass placeholders and css classes. The output can be modified with `--no-sass-placeholder` and `--no-css-class`. Important to note that they can't both be disabled, and these flags are not valid for `css` output.

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

```html
<button class="bttn-add">Add</button>
```

```scss
.bttn-add:before { // or .bttn-add:after {
  @extend %collecticon-add;
}
```
Using this approach allows the usage of up to two icons per element (one per selector).

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


### Bundle
Creates a zip file with the fonts, css styles, and the icons. *Used to prepare the library for distribution.*
```
$ collecticons bundle source/ destination.zip
```

## Testing
The testing is done using mocha. Use `yarn test` to run the tests.

## Contributing
You are free to contribute to the project. If you find a bug and/or have a nice idea about a feature feel free to open an issue or submit your own solution. We'll be more than happy to hear your suggestions. :)

## License
Collecticons is licensed under **The MIT License (MIT)**, see the [LICENSE](LICENSE) file for more details.
