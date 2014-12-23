# grunt-digestif

> Creates a heirarchical digest of a folder using AMD for uncompiled library loading.

## Getting Started
This plugin requires Grunt `~0.4.5`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-digestif --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-digestif');
```

## The "digestif" task

### Overview
In your project's Gruntfile, add a section named `digestif` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  digestif: {
    targetName: {
      path: './path/to/project/root',
      prefix: 'myapp',
      loadLibraries: ['yourapp/YourApp', 'hisapp/HisApp'],
      ignore: ['r']
    }
  }
});
```

### Digests

You may have any number of projects to digest. They will be executed in order.

#### digest.path
Type: `String`
Required

A path to the directory you want digested. Relative to the project root.

#### digest.prefix
Type: `String`
Required

This is your AMD path for this directory.

#### digest.ignore
Type: `Array[string]`
Optional

This allows you to skip modules (do not put a .js)

#### digest.loadLibraries
Type: `Array[string]`
Optional

Allows you to specify other libraries to load by package name.