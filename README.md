# Portent

Simple best-practices static website generator.

## Quick start
Run `npm install --save portent`, then add two scripts to your `package.json`:

```json
"scripts": {
	"start": "portent run .",
	"build": "portent build ."
}
```

Then create a `pages` directory, maybe a few more files as described below, run `npm start` and start editing and using your website.

## File hierarchy convention
The website project directory should look as follows:

```
/css
  header.css
  typography.css
/img
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
```

Anywhere in the tree files and directories prefixed with an `_` are ignored.

### Page structure
`/pages` directory contains actual routes for pages in the website. Every `html` file inside is a single URL route.

### CSS
All CSS are combined and included in your HTML.

To refer to images, use `url('img/...')` syntax regardless of what's the depth of CSS file in the directory tree.

### JS
All JavaScript files are combined and included in your HTML.

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

## Usage

### Development server
To develop your website, run a development server in the terminal: `portent run .` or in Node: `portent(directory).server.listen(port)`.

### Building for production
To build the website for production, use `portent build .`, or in Node `portent(directory).build(destination)`.
