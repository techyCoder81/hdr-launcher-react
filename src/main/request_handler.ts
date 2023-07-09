import {
  BrowserWindow,
  contextBridge,
  ipcMain,
  ipcRenderer,
  app,
} from 'electron';
import { Progress, Messages, Responses } from 'nx-request-api';

import * as fs from 'fs';
import * as path from 'path';
import * as md5 from 'md5-file';
import * as extract from 'extract-zip';
import * as axios from 'axios';
import { OkOrError } from 'nx-request-api/lib/responses';
import * as Process from 'child_process';
import * as net from 'net';
import { mainWindow } from './main';
import Config from './config';

const webrequest = require('request');
const explorer = require('open-file-explorer');

function readDirAll(dir: string, tree: Responses.DirTree, depth: number) {
  // let tabs = "";
  // for (let i = 0; i < depth; ++i) {tabs += "\t";}
  const here = fs.readdirSync(dir);
  here.forEach((thispath) => {
    const fullpath = path.join(dir, thispath);
    if (fs.statSync(fullpath).isFile()) {
      // console.debug(tabs + "File: " + thispath);
      tree.files.push(thispath);
    } else {
      // console.debug(tabs + "Directory: " + thispath);
      const subtree = new Responses.DirTree(thispath);
      tree.dirs.push(subtree);
      readDirAll(fullpath, subtree, depth + 1);
    }
  });
}

export class RequestHandler {
  async handle(request: any): Promise<Responses.OkOrError> {
    return new Promise<Responses.OkOrError>(async (resolve) => {
      try {
        handleInner(request, resolve);
      } catch (e) {
        alert(
          `uncaught error handling request:\n${JSON.stringify(
            request
          )}\nError:${e}`
        );
        resolve(
          new Responses.OkOrError(
            false,
            `uncaught error handling request:\n${JSON.stringify(
              request
            )}\nError:${e}`,
            request.id
          )
        );
      }
    });
  }
}

async function handleInner(
  request: any,
  resolve: (
    value: Responses.OkOrError | PromiseLike<Responses.OkOrError>
  ) => void
) {
  // define the argument check "macro"
  function argcheck(count: number): boolean {
    if (request.arguments == 0 || request.arguments === undefined) {
      console.error(
        `no arguments were provided for request${request.call_name}`
      );
      resolve(
        new Responses.OkOrError(
          false,
          `no arguments were provided for request ${request.call_name}`,
          request.id
        )
      );
      return false;
    }
    if (request.arguments.length < 1) {
      console.error(`not enough args passed for request ${request.call_name}`);
      resolve(
        new Responses.OkOrError(
          false,
          `not enough args passed for request${request.call_name}`,
          request.id
        )
      );
      return false;
    }
    return true;
  }

  const name = request.call_name;
  console.info(`handling request: ${name}`);
  switch (name) {
    case 'ping':
      resolve(
        new Responses.OkOrError(
          true,
          'ping was received and processed!',
          request.id
        )
      );
      break;
    case 'get_platform':
      resolve(new Responses.OkOrError(true, 'Ryujinx', request.id));
      break;
    case 'get_sdcard_root':
      resolve(
        new Responses.OkOrError(true, Config.getSdcardPath(), request.id)
      );
      break;
    case 'is_installed':
      resolve(
        new Responses.OkOrError(
          true,
          String(
            fs.existsSync(
              path.join(Config.getSdcardPath(), 'ultimate/mods/hdr')
            )
          ),
          request.id
        )
      );
      break;
    case 'get_version':
      try {
        // ensure that hdr is installed
        const versionFile: string = path.join(
          Config.getSdcardPath(),
          'ultimate/mods/hdr/ui/hdr_version.txt'
        );
        const exists = fs.existsSync(versionFile);
        if (!exists) {
          resolve(
            new Responses.OkOrError(
              false,
              'Version file does not exist! HDR may not be installed.',
              request.id
            )
          );
          break;
        }

        // read the version
        const version = fs.readFileSync(versionFile, 'utf-8');
        resolve(new Responses.OkOrError(true, version, request.id));
        break;
      } catch (e) {
        resolve(new Responses.OkOrError(false, String(e), request.id));
        break;
      }
    case 'read_file':
      try {
        if (!argcheck(1)) {
          break;
        }

        const args = request.arguments;
        // read the given file path
        const file: string = args[0];
        const exists = fs.existsSync(file);
        if (!exists) {
          resolve(
            new Responses.OkOrError(
              false,
              `specified (${file}) file does not exist! HDR may not be installed.`,
              request.id
            )
          );
          break;
        }

        // read the file
        const text = fs.readFileSync(file, 'utf-8');
        resolve(new Responses.OkOrError(true, text, request.id));
        break;
      } catch (e) {
        resolve(new Responses.OkOrError(false, String(e), request.id));
        break;
      }
    case 'download_file':
      var out: fs.WriteStream | null = null;
      try {
        if (!argcheck(2)) {
          break;
        }

        const args = request.arguments;
        const url = args[0];
        const location = args[1];
        console.log(
          `preparing to download...\nurl: ${url}\nlocation: ${location}`
        );
        if (mainWindow == null) {
          console.error('cannot download without a main window!');
          resolve(
            new Responses.OkOrError(
              false,
              'cannot download without a main window!',
              request.id
            )
          );
          break;
        }

        if (url === null || url === undefined || url.length == 0) {
          resolve(
            new Responses.OkOrError(
              false,
              `cannot download from an invalid url: ${url}`,
              request.id
            )
          );
          break;
        }

        if (fs.existsSync(location)) {
          fs.unlinkSync(location);
        }

        fs.mkdirSync(path.dirname(location), { recursive: true });

        console.info('beginning download.');
        console.info(`Absolute path: ${location}`);
        out = fs.createWriteStream(location, { mode: 0o777 });
        console.debug('created write stream');

        const req = webrequest({
          method: 'GET',
          uri: url,
          headers: { 'User-Agent': 'HDR Launcher' },
        });

        let current = 0;
        let total = 0;
        let complete = false;

        let outcome: Responses.OkOrError | null = null;
        req.on('response', function (data: any) {
          console.info(`status code: ${data.statusCode}`);
          if (data.statusCode > 300) {
            console.error('download failed due to bad status code.');
            if (out != null && !out.destroyed) {
              out.close();
            }
            outcome = new Responses.OkOrError(
              false,
              `download failed with status code: ${data.statusCode}`,
              request.id
            );
            complete = true;
          }
          total = data.headers['content-length'];
        });

        const counter = 0;
        req.on('data', function (chunk: any) {
          current += chunk.length;
          mainWindow?.webContents.send(
            'progress',
            new Progress(
              'Downloading...',
              `Downloading from ${url}`,
              current / total
            )
          );
        });

        req.on('end', function () {
          if (out != null && !out.destroyed) {
            out.close();
          }
          if (outcome == null) {
            resolve(
              new Responses.OkOrError(
                true,
                'download finished successfully',
                request.id
              )
            );
          } else {
            resolve(outcome);
          }
        });

        req.on('error', function (e: any) {
          console.log(`Error: ${e.message}`);
          if (out != null && !out.destroyed) {
            out.close();
          }
          resolve(
            new Responses.OkOrError(
              false,
              `download failed with error: ${e.message}`,
              request.id
            )
          );
        });

        req.pipe(out);

        break;
      } catch (e) {
        if (out != null && !out.destroyed) {
          out.close();
        }
        resolve(
          new Responses.OkOrError(
            false,
            `Error during download: ${String(e)}`,
            request.id
          )
        );
        break;
      }
    case 'get_md5':
      try {
        if (!argcheck(1)) {
          break;
        }

        const args = request.arguments;
        // read the given file path
        const file: string = args[0];
        const exists = fs.existsSync(file);
        if (!exists) {
          resolve(
            new Responses.OkOrError(
              false,
              `specified file (${file}) for md5 does not exist!`,
              request.id
            )
          );
          console.info('Failed - file does not exist.');
          break;
        }

        // get the md5
        const hash = md5.sync(file);
        resolve(new Responses.OkOrError(true, hash, request.id));
        console.info('Resolved.');
        break;
      } catch (e) {
        resolve(new Responses.OkOrError(false, String(e), request.id));
        break;
      }
    case 'open_mod_manager':
      try {
        explorer(`${Config.getSdcardPath()}ultimate/mods/`, (err: any) => {
          if (err) {
            resolve(new Responses.OkOrError(false, err.toString(), request.id));
          } else {
            resolve(new Responses.OkOrError(true, 'done', request.id));
          }
        });
        break;
      } catch (e) {
        resolve(new Responses.OkOrError(true, String(e), request.id));
        break;
      }
    case 'file_exists':
      try {
        if (!argcheck(1)) {
          break;
        }

        // read the given file path
        const file: string = request.arguments[0];

        resolve(
          new Responses.OkOrError(
            true,
            String(fs.existsSync(file) && fs.statSync(file).isFile()),
            request.id
          )
        );
        break;
      } catch (e) {
        resolve(new Responses.OkOrError(true, 'false', request.id));
        break;
      }
    case 'is_mod_enabled':
      try {
        if (!argcheck(1)) {
          break;
        }

        // read the given file path
        const file: string = request.arguments[0];

        // on ryujinx, if the folder name exists, then its enabled
        resolve(
          new Responses.OkOrError(
            true,
            String(fs.existsSync(file) && fs.statSync(file).isDirectory()),
            request.id
          )
        );
        break;
      } catch (e) {
        resolve(new Responses.OkOrError(true, 'false', request.id));
        break;
      }
    case 'dir_exists':
      try {
        if (!argcheck(1)) {
          break;
        }

        // read the given dir path
        const dir: string = request.arguments[0];

        resolve(
          new Responses.OkOrError(
            true,
            String(fs.existsSync(dir) && fs.statSync(dir).isDirectory()),
            request.id
          )
        );
        break;
      } catch (e) {
        resolve(new Responses.OkOrError(true, 'false', request.id));
        break;
      }
    case 'remove_dir_all':
      try {
        if (!argcheck(1)) {
          break;
        }

        // read the given dir path
        const dir: string = request.arguments[0];

        if (!fs.existsSync(dir)) {
          resolve(
            new Responses.OkOrError(false, 'path does not exist!', request.id)
          );
          break;
        }

        fs.rmSync(dir, { recursive: true, force: true });
        resolve(
          new Responses.OkOrError(
            true,
            'removed directory successfully',
            request.id
          )
        );
        break;
      } catch (e) {
        resolve(new Responses.OkOrError(false, String(e), request.id));
        break;
      }
    case 'list_dir':
      try {
        if (!argcheck(1)) {
          break;
        }

        // read the given dir path
        const dir: string = request.arguments[0];

        if (!fs.existsSync(dir)) {
          resolve(
            new Responses.OkOrError(false, 'path does not exist!', request.id)
          );
          break;
        }
        if (!fs.statSync(dir).isDirectory()) {
          resolve(
            new Responses.OkOrError(
              false,
              'path was not a directory!',
              request.id
            )
          );
          break;
        }

        const items = fs.readdirSync(dir);
        const entries: Responses.PathEntry[] = [];
        items.forEach((item) => {
          const fullpath = path.join(dir, item);
          if (fs.statSync(fullpath).isDirectory()) {
            entries.push(
              new Responses.PathEntry(fullpath, Responses.PathEntry.DIRECTORY)
            );
          } else {
            entries.push(
              new Responses.PathEntry(fullpath, Responses.PathEntry.FILE)
            );
          }
        });

        const list = new Responses.PathList(entries);
        resolve(
          new Responses.OkOrError(true, JSON.stringify(list), request.id)
        );
        break;
      } catch (e) {
        resolve(new Responses.OkOrError(false, String(e), request.id));
        break;
      }
    case 'list_all_files':
      try {
        if (!argcheck(1)) {
          break;
        }

        // read the given dir path
        const dir: string = request.arguments[0];

        if (!fs.existsSync(dir)) {
          resolve(
            new Responses.OkOrError(false, 'path does not exist!', request.id)
          );
          break;
        }
        if (!fs.statSync(dir).isDirectory()) {
          resolve(
            new Responses.OkOrError(
              false,
              'path was not a directory!',
              request.id
            )
          );
          break;
        }

        const tree = new Responses.DirTree(dir);
        readDirAll(dir, tree, 0);

        resolve(
          new Responses.OkOrError(true, JSON.stringify(tree), request.id)
        );
        break;
      } catch (e) {
        resolve(new Responses.OkOrError(false, String(e), request.id));
        break;
      }

    case 'unzip':
      try {
        if (!argcheck(2)) {
          break;
        }

        // read the given file path
        const filepath: string = request.arguments[0];

        // read the given dir path
        const destination: string = request.arguments[1];

        if (!fs.existsSync(destination)) {
          resolve(
            new Responses.OkOrError(
              false,
              'destination does not exist!',
              request.id
            )
          );
          break;
        }
        if (!fs.statSync(destination).isDirectory()) {
          resolve(
            new Responses.OkOrError(
              false,
              'destination was not a directory!',
              request.id
            )
          );
          break;
        }

        if (!fs.existsSync(filepath)) {
          resolve(
            new Responses.OkOrError(
              false,
              'filepath does not exist!',
              request.id
            )
          );
          break;
        }
        if (!fs.statSync(filepath).isFile()) {
          resolve(
            new Responses.OkOrError(
              false,
              'filepath was not a file!',
              request.id
            )
          );
          break;
        }

        await extract.default(filepath, { dir: destination });
        resolve(
          new Responses.OkOrError(
            true,
            'file extracted successfully!',
            request.id
          )
        );
        break;
      } catch (e) {
        resolve(new Responses.OkOrError(false, String(e), request.id));
        break;
      }
    case 'get_request':
      try {
        if (!argcheck(1)) {
          break;
        }

        // read the given url
        const url: string = request.arguments[0];

        await axios.default
          .get(url, { timeout: 30000 })
          .then((res) => {
            if (res.status >= 300) {
              console.info(`failed status code: ${res.status}`);
              resolve(
                new Responses.OkOrError(
                  false,
                  `Response code was not successful: ${res.status}`,
                  request.id
                )
              );
            } else {
              console.info(JSON.stringify(res.data));
              resolve(
                new Responses.OkOrError(
                  true,
                  typeof res.data === 'string'
                    ? res.data
                    : JSON.stringify(res.data),
                  request.id
                )
              );
            }
          })
          .catch((e) => {
            console.error(`Error during get: ${e}`);
            resolve(
              new Responses.OkOrError(
                false,
                String(`Error during get: ${e}`),
                request.id
              )
            );
          });
        break;
      } catch (e) {
        resolve(new Responses.OkOrError(false, String(e), request.id));
        break;
      }
    case 'delete_file':
      try {
        if (!argcheck(1)) {
          break;
        }

        const args = request.arguments;
        // read the given file path
        const file: string = args[0];
        const exists = fs.existsSync(file);
        if (!exists) {
          resolve(
            new Responses.OkOrError(
              false,
              'specified file already does not exist',
              request.id
            )
          );
          break;
        }

        // delete the file
        const text = fs.unlinkSync(file);
        resolve(
          new Responses.OkOrError(
            true,
            'File deleted successfully.',
            request.id
          )
        );
        break;
      } catch (e) {
        resolve(new Responses.OkOrError(false, String(e), request.id));
        break;
      }
    case 'write_file':
      try {
        if (!argcheck(2)) {
          break;
        }

        const args = request.arguments;
        // read the given file path
        const file: string = args[0];
        const exists = fs.existsSync(file);
        if (exists) {
          console.info('deleting existing file...');
          fs.unlinkSync(file);
        }

        // write the file
        fs.writeFileSync(file, args[1]);
        resolve(
          new Responses.OkOrError(
            true,
            'File written successfully.',
            request.id
          )
        );
        break;
      } catch (e) {
        resolve(new Responses.OkOrError(false, String(e), request.id));
        break;
      }
    case 'get_launcher_version':
      try {
        const pjson = require('../../release/app/package.json');
        resolve(new Responses.OkOrError(true, pjson.version, request.id));
        break;
      } catch (e) {
        resolve(new Responses.OkOrError(false, String(e), request.id));
        break;
      }
    case 'mkdir':
      try {
        if (!argcheck(1)) {
          break;
        }

        const args = request.arguments;
        fs.mkdirSync(args[0], { recursive: true });
        resolve(
          new Responses.OkOrError(true, 'directory now exists.', request.id)
        );
        break;
      } catch (e) {
        resolve(new Responses.OkOrError(false, String(e), request.id));
        break;
      }
    case 'clone_mod':
      try {
        if (!argcheck(2)) {
          break;
        }
        const args = request.arguments;
        const src = args[0];
        const dest = args[1];
        // make sure the assets dir exists
        const assetsDir: string = path.join(
          Config.getSdcardPath(),
          `ultimate/mods/${src}`
        );
        let exists = fs.existsSync(assetsDir);
        if (!exists) {
          resolve(
            new Responses.OkOrError(
              false,
              `${src} dir does not exist, so we cannot clone it!`,
              request.id
            )
          );
          break;
        }

        const prAssetsDir: string = path.join(
          Config.getSdcardPath(),
          `ultimate/mods/${dest}`
        );

        // remove the existing pr assets dir if there is one
        exists = fs.existsSync(prAssetsDir);
        if (exists) {
          fs.rmSync(prAssetsDir, { recursive: true, force: true });
        }

        // copy the directory
        fs.cpSync(assetsDir, prAssetsDir, { recursive: true });
        resolve(
          new Responses.OkOrError(
            true,
            `cloned ${src} successfully`,
            request.id
          )
        );
        break;
      } catch (e) {
        resolve(new Responses.OkOrError(false, String(e), request.id));
        break;
      }
    case 'exit_application':
      app.quit();
      break;
    case 'exit_session':
      // play the game
      // resolve(new Responses.OkOrError(true, "starting the game...", request.id));
      let command = path.normalize(
        `${Config.getRyuPath()} "${Config.getRomPath()}"`
      );
      if (process.platform == 'win32') {
        command = `cmd /C ""${Config.getRyuPath()}" a "${Config.getRomPath()}""`;
      }
      console.log(`Starting the game, with command: ${command}`);
      Process.exec(command, (result) => {
        mainWindow?.show();
        resolve(
          new Responses.OkOrError(
            true,
            `Exit status: ${String(result)}`,
            request.id
          )
        );
      });
      mainWindow?.hide();

      let did_connect = false;
      const connect = () => {
        const s = net.createConnection(6969, 'localhost');
        s.on('data', function (data) {
          did_connect = true;
          console.log(data.toString());
        });
        s.on('error', (e) => {
          if (!did_connect) {
            console.info('waiting for skyline logger...');
            setTimeout(connect, 1000);
          }
        });
      };
      setTimeout(connect, 1000);
      break;
    default:
      console.error(`Could not handle request with name: ${name}`);
      resolve(
        new Responses.OkOrError(
          false,
          `unable to handle request ${name}`,
          request.id
        )
      );
  }
}
