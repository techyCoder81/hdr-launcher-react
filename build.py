#! python3
import os, sys

root_dir = os.getcwd()

ip = ""
electron = False
listen = False
no_npm = ""
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
    if "updater" in arg:
        updater = " --features updater"
    if "no-npm" in arg:
        no_npm = " --features no-npm"
    if "help" in arg:
        print("usage:")
        print("ip=0.0.0.0 : send the plugin to the switch at the given IP")
        print("electron : 'npm start'")
        print("listen : 'cargo skyline listen'")
        print("updater : enables the updater feature on the plugin")
        print("help : shows this help message.")
        print("no-npm : enable the no-npm feature")
        exit()

os.chdir("switch")

success = os.system("cargo skyline build --release" + updater + no_npm);
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