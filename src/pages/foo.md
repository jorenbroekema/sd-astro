---
layout: ../layouts/Layout.astro
---

# Foo

Description

~ some-crazy-syntax-start

```json tokens
{
  "colors": {
    "yellow": {
      "value": "#ffff00",
      "type": "color"
    }
  }
}
```

```js script
import StyleDictionary from 'style-dictionary';
console.log('hello world');

console.log(StyleDictionary.VERSION)
// import Color from 'tinycolor2';

// StyleDictionary.registerTransform({
//   type: 'value',
//   name: 'foo:my-transform',
//   matcher: () => true,
//   transformer: (token) => token.value,
// })
```

```js config
export default {
  platforms: {
    js: {
      transformGroup: 'js',
      files: [{
        destination: 'vars.js',
        format: 'javascript/es6'
      }]
    }
  }
}
```

~ some-crazy-syntax-end

Some more docs here...

~ some-crazy-syntax-start

```js tokens
export default {
  colors: {
    purple: {
      value: "#ff00ff",
      type: "color"
    }
  }
}
```

```js script
console.log('hello planet!');
// import Color from 'tinycolor2';
// import StyleDictionary from 'style-dictionary';

// StyleDictionary.registerTransform({
//   type: 'value',
//   name: 'foo:my-transform',
//   matcher: () => true,
//   transformer: (token) => token.value,
// })
```

~ some-crazy-syntax-end
