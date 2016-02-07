# ![portent: perfect websites](media/logo.png)

[![Build Status](https://travis-ci.org/denis-sokolov/portent.svg?branch=master)](https://travis-ci.org/denis-sokolov/portent)
[![Dependency Status](https://gemnasium.com/denis-sokolov/portent.svg)](https://gemnasium.com/denis-sokolov/portent)
[![Codacy Badge](https://api.codacy.com/project/badge/5386b47284f34b5f85cfca06976f4cdc)](https://www.codacy.com/app/denis-sokolov/portent)
[![Code Climate](https://codeclimate.com/github/denis-sokolov/portent/badges/gpa.svg)](https://codeclimate.com/github/denis-sokolov/portent)
[![bitHound Score](https://app.bithound.io/denis-sokolov/portent/badges/score.svg)](http://app.bithound.io/denis-sokolov/portent)

Simple best-practices static website generator.

## Quick start
Run `npm install --save portent`, then add two scripts to your `package.json`:

```json
"scripts": {
	"start": "portent run .",
	"build": "portent build .",
	"deploy": "portent deploy . my-ssh-server:path/to/destination"
}
```

Then create a `pages` directory, maybe a few more files as described below, run `npm start` and start editing and using your website.

## File hierarchy convention
The website project directory should look as follows:

```
/css
  header.css
  typography.less
/errors
  404.html
/img
  favicon.png
  p1.jpg
  logo.png
/js
  /_stuff
  fluidImages.js
  base.js
/pages
  index.html
  about.html
  _fragment.html
/static
  other-public-files.txt
robots.txt
```

Anywhere in the tree files and directories prefixed with an `_` are ignored.

The structure above will produce a website that responds to URLs `/` and `/about`.

### Page structure
`pages` directory contains actual routes for pages in the website. Every `html` file inside is a single URL route. Pages with Unicode names do not work perfectly, but if they work for you, great.

It is recommended to include a <base> tag in every template and refer to files and URLs relative to the root of the project, without using a leading slash. For example, to link from `projects/foo` to `about`, use a string `about`, not `../about`. A workflow different from this has undefined behavior.

### Errors
`errors` directory contains templates for HTTP errors.

### CSS
All CSS are combined and included in your HTML.

To refer to images, use `url('foo.png')` syntax, where the images are located in the same directory as your CSS file, or deeper with `url('foo/bar.png')`.

If a file ends in `.less`, it will be processed with LESS. Take care to ensure your submodules are hidden behind an `_` name, or else they will be included twice.

#### Portent-base
Portent includes a base stylesheet that promotes some best practices. Import it using `@import 'portent/base.less'`.

### JS
All JavaScript files are combined and included in your HTML.

If a file ends in `.min.js`, it will not be processed, but included as is in a separate bundle and will run before your regular scripts.

If a file ends in `.cjs.js`, it will be Browserified. Take care to ensure your submodules are hidden behind an `_` name, or else they will be included twice.

### HTML
HTML files are processed using [nunjucks](https://github.com/mozilla/nunjucks) templating syntax that is primarily useful for its [`extends` tag](https://mozilla.github.io/nunjucks/templating.html#extends).

#### Portent-base
Portent includes a base template for HTML websites that promotes best practices in HTML authoring. Use it by extending in your templates with `{% extends "portent/base.html" %}`, and then defining blocks and variables as follows:

```
{% extends "portent/base.html" %}

{% block title %}
	Document title
{% endblock %}

{% block head %}
	<meta name=description content="">
	<link rel=stylesheet href="http://fonts.googleapis.com/...">
{% endblock %}

{% block body %}
	<header>Website-generic content</header>
	<div>
	    Include new custom blocks for further extending:
	    {% block content %}{% endblock %}
	</div>
{% endblock %}
```

If your website is non-English, make sure to set the language with a `{% set lang='XX' %}` anywhere in the template.

Set a theme color for your website to use whenever it is possible to customize browser chrome with `{% set themeColor='blue' %}`. Any CSS color or syntax works.

### Images
Images in `img` will become part of your website.

If a file `favicon.png` is present in the root of your images directory, it will be added to your website as a proper favicon, resized and included in HTML. It is recommended to have the base favicon in at least the 196x196 size.

### Static
Everything in `static` will become part of your website. Use this to host fonts, videos, other resources of the sort.

## Usage

### Development server
To develop your website, run a development server in the terminal: `portent run .` or in Node: `portent(directory).server.listen(port)`.

### Building for production
To build the website for production, use `portent build .`, or in Node `portent(directory).build(destination, { onWarning: console.log.bind(console) })`.

### Deploying
To deploy the website, portent exposes a nicer way to use rsync on your machine. Run `portent deploy . ssh-server:path/on/remote/`.
