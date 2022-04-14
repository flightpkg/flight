package main

/* Importing the packages that are needed for Flight to run. */
import (
	funcs "flight/funcs"
	settings "flight/settings"
	install "flight/src/install"
	uninstall "flight/src/uninstall"
	"fmt"
	"os"

	"github.com/gookit/color"
)

/* Getting the arguments that are passed to the program. */
var args = os.Args[1:]

/* Printing out the help menu. */
func help() {
	fmt.Println(color.Bold.Text(color.BgGreen.Text("Commands:")))
	fmt.Println(color.Green.Text("install") + " - " + "Install all dependencies from package.json")
	fmt.Println(color.Green.Text("uninstall [dep]") + " - " + "Uninstall a dependency.")
}

/* Checking if the user has passed any arguments to the program. If they have, it will check if the
first argument is `version`. If it is, it will print out the version of Flight. If it is not, it
will check if the first argument is `install`. If it is, install dependencies from `package.json`
If it is not, it will print out the help menu. If the user has not passed any arguments to
the program, also it will print out the help menu. */
func main() {
	if len(args) > 0 {
		if args[0] == "version" {
			funcs.Log(settings.Version)
		} else if args[0] == "install" {
			if len(args) > 1 {
				install.Install(args[1:])
			} else {
				install.InstallAll()
			}
		} else if len(args) > 1 && args[0] == "uninstall" {
			uninstall.Uninstall(args[1])
		} else {
			help()
		}
	} else {
		help()
	}

}
