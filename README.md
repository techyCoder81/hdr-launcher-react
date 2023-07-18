The HDR Launcher, this time written in the React framework with TypeScript with both a Switch and Desktop backend.
Switch backend runs as a skyline plugin using skyline-web.
Desktop application is an electron app for use with Ryujinx.

Releases can be found on the [releases page](https://github.com/techyCoder81/hdr-launcher-react/releases), or bundled as part of HDR [Beta](https://github.com/HDR-Development/HDR-Releases/releases) and [Nightly](https://github.com/HDR-Development/HDR-Nightlies/releases) full packages.

![launcher_main](https://user-images.githubusercontent.com/42820193/205082618-e6fbaf05-cced-4625-bbfb-372536f5f2aa.png)
![launcher_verify](https://user-images.githubusercontent.com/42820193/205082615-de3591f8-5054-4d26-98ff-706afe0f1159.png)
![launcher_logs](https://user-images.githubusercontent.com/42820193/205082612-b96e96c0-a93d-4519-a9e6-940d51c95fd7.png)
![pr_menu](https://github.com/techyCoder81/hdr-launcher-react/assets/42820193/976f3af1-c1f3-42d0-a3fc-461efca22244)
![stage_config](https://github.com/techyCoder81/hdr-launcher-react/assets/42820193/9428ac6b-ad0f-4ebe-8348-48ea790a968e)



## Building

Use a package manager of your choice (npm, yarn, etc.) in order to install all dependencies

```bash
yarn install
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
