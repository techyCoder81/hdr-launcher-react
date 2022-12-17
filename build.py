#! python3
import os, sys

root_dir = os.getcwd()

ip = ""
electron = False
listen = False
package = False
updater = ""

for arg in sys.argv:
    if "ip" in arg:
        if not "=" in arg:
            print("ip specified but not ip argument given!")
        else:
            ip = arg.split('=')[1]
    if "electron" in arg:
        electron = True
    if "listen" in arg:
        listen = True
    if "npm" in arg:
        package = True
    if "updater" in arg:
        updater = " --features updater"

if package:
    success = os.system("npm build")
    if success != 0:
        exit("NPM BUILD FAILED!")

os.chdir("switch")

success = os.system("cargo skyline build --release" + updater);
if success != 0:
    exit("SWITCH BUILD FAILED!")

if not ip == "":
    if os.name == 'nt':
        os.system('curl.exe -T target\\aarch64-skyline-switch\\release\\libhdr_launcher_react.nro ftp://' + ip + ':5000/atmosphere/contents/01006A800016E000/romfs/skyline/plugins/hdr-launcher.nro')
    else:
        os.system('curl -T target/aarch64-skyline-switch/release/libhdr_launcher_react.nro ftp://' + ip + ':5000/atmosphere/contents/01006A800016E000/romfs/skyline/plugins/hdr-launcher.nro')

if listen:
    os.system("cargo skyline listen")

os.chdir(root_dir)

if electron:
    os.system("npm start")