The HDR Launcher, this time written in the React framework with TypeScript with both a Switch and Desktop backend.
Switch backend runs as a skyline plugin using skyline-web.
Desktop application is an electron app for use with Ryujinx.

## Installation

Use a package manager of your choice (npm, yarn, etc.) in order to install all dependencies

```bash
yarn
```

## Usage

Just run `start` script to run as electron app.

```bash
yarn start
```
To package the electron app, and then compile the skyline plugin, use:
```bash
python3 build.py package <optionally, ip=0.0.0.0> <optionally, listen>
```

## Packaging

To generate the electron project package based on the OS you're running on, just run:

```bash
yarn package
```

## License

[MIT](https://choosealicense.com/licenses/mit/)
