#! python3
import os, sys

root_dir = os.getcwd()

ip = ""
electron = False
listen = False
package = False

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
    if "package" in arg:
        package = True

if package:
    success = os.system("yarn package")
    if success != 0:
        exit("YARN BUILD FAILED!")

os.chdir("switch")

success = os.system("cargo skyline build --release");
if success != 0:
    exit("SWITCH BUILD FAILED!")

if not ip == "":
    if os.name == 'nt':
        os.system('curl.exe -T target\\aarch64-skyline-switch\\release\\libhdr_launcher_react.nro ftp://' + ip + ':5000/atmosphere/contents/01006A800016E000/romfs/skyline/plugins/hdr_launcher_react.nro')
    else:
        os.system('curl -T target/aarch64-skyline-switch/release/libhdr_launcher_react.nro ftp://' + ip + ':5000/atmosphere/contents/01006A800016E000/romfs/skyline/plugins/hdr_launcher_react.nro')

if listen:
    os.system("cargo skyline listen")

os.chdir(root_dir)

if electron:
    os.system("yarn start")