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
	if _, ok := pkgJson.Dependencies[name]; ok {
		for name := range pkgJson.Dependencies {
			for i < len(pkgJson.Dependencies) {
				name := name
				version := pkgJson.Dependencies[name]
				delete(pkgJson.Dependencies, name)
				os.Remove("./node_modules/" + name)
				fmt.Println(color.Bold.Text(color.Green.Text("Uninstalled")) + " " + name + "@" + version)
			}
		}
	} else {
		// print pacakge not found with name
		fmt.Println(color.Bold.Text(color.Red.Text("Error:")) + " \"" + name + "\" " + color.Bold.Text(color.Red.Text("not found.")))
	}

	jsonData, _ := json.Marshal(pkgJson)
	jsonData, _ = json.MarshalIndent(pkgJson, "", "\t")
	ioutil.WriteFile("./package.json", jsonData, os.ModePerm)
}
