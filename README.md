# ContainerUp Web

This project is the frontend page of the [ContainerUp](https://github.com/ContainerUp) project.
It works alongside the [API backend](https://github.com/ContainerUp/containerup) project.

## How to get started

```shell
# Install dependencies
npm install

# Run the app in the development mode
npm start

```

## Configuration

To work with the backend, edit `src/setupProxy.js`.
Replace the `target` value with the url of your own server.

Remember to stop and run `npm start` again.

## Environment variables

```shell
# version information showed in the app
REACT_APP_CONTAINERUP_BUILD=development_build
REACT_APP_CONTAINERUP_COMMIT=0000000

# Set this value to 1 and it's the demo as on https://demo.containerup.org/
REACT_APP_CONTAINERUP_DEMO=
# Google analytics 4, only used in the demo
REACT_APP_CONTAINERUP_GA4=
```

