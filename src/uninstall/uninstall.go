package flight

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"os"

	color "github.com/gookit/color"
)

type Package struct {
	Dependencies map[string]string
}

func Uninstall(name string) {
	jsonFile, err := os.Open("./package.json")
	bytes, _ := ioutil.ReadAll(jsonFile)
	var pkgJson Package
	if err != nil {
		fmt.Println(err)
	}

	json.Unmarshal(bytes, &pkgJson)

	fmt.Println(color.Bold.Text(color.BgGreen.Text("Uninstaller:")))

	i := 0
	for name := range pkgJson.Dependencies {
		for i < len(pkgJson.Dependencies) {
			name := name
			version := pkgJson.Dependencies[name]
			if pkgJson.Dependencies[name] == version {
				delete(pkgJson.Dependencies, name)
				os.Remove("./node_modules/" + name)
				fmt.Println(color.Bold.Text(color.Green.Text("Uninstalled")) + " " + name + "@" + version)
			} else {
				fmt.Println(color.Bold.Text(color.BgRed.Text("Error:")) + " " + name + "@" + version + " is not installed")
			}
		}
	}

	jsonData, _ := json.Marshal(pkgJson)
	ioutil.WriteFile("./package.json", jsonData, os.ModePerm)
}
