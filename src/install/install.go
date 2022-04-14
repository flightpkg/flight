package flight

/* Importing the packages that are needed for Package Installer to run. */
import (
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"net/http"
	"os"

	color "github.com/gookit/color"
	targz "github.com/walle/targz"
)

/* Creating a struct that will be used to store the data from the package.json file. */
type Package struct {
	dependencies map[string]string
}

/* Downloading the dependencies from the package.json file and installing them. */
func InstallAll() {
	/* Opening the package.json file and reading it. */
	jsonFile, err := os.Open("./package.json")
	bytes, _ := ioutil.ReadAll(jsonFile)
	var pkgJson Package
	if err != nil {
		fmt.Println(err)
	}

	/* Unmarshalling the bytes from the package.json file into the struct `Package`. */
	json.Unmarshal(bytes, &pkgJson)

	/* Creating the directories `.flight` and `node_modules` in the current directory. */
	os.Mkdir("./.flight", os.ModePerm)
	os.Mkdir("./node_modules", os.ModePerm)

	/* Downloading the dependencies from the package.json file and installing them. */
	i := 0
	fmt.Println(color.Bold.Text(color.BgGreen.Text("Installer:")))

	for name := range pkgJson.dependencies {
		for i < len(pkgJson.dependencies) {
			/* Downloading the dependencies from the package.json file and installing them. */
			name := name
			version := pkgJson.dependencies[name]
			fileUrl := fmt.Sprintf("https://registry.yarnpkg.com/%v/-/%v-%v.tgz", name, name, version)
			err := downloadFile(fmt.Sprintf("./.flight/%s.tgz", name), fileUrl)
			if err != nil {
				fmt.Println(color.Bold.Text(color.BgRed.Text("Error: ")) + err.Error())
			}
			fmt.Println(color.Bold.Text(color.Green.Text("Downloaded")) + " " + name + "@" + version)

			/* Extracting the downloaded tarball into the `node_modules` directory. */
			err = targz.Extract(fmt.Sprintf("./.flight/%s.tgz", name), "./node_modules/")
			if err != nil {
				fmt.Println(color.Bold.Text(color.BgRed.Text("Error:")) + "\n" + err.Error())
				os.Exit(1)
			}

			/* Renaming the directory `package` to the name of the package. */
			err = os.Rename("./node_modules/package", fmt.Sprintf("./node_modules/%s", name))
			if err != nil {
				fmt.Println(color.Bold.Text(color.BgRed.Text("Error:")) + " " + fmt.Sprintf("Package \"%s\" already exists/could not be installed.", name))
				os.RemoveAll("./node_modules/package")
				os.Exit(0)
			}

			/* Removing the downloaded tarball from the `.flight` directory. */
			os.Remove(fmt.Sprintf("./.flight/%s.tgz", name))
			fmt.Println(color.Bold.Text(color.Green.Text("Extracted")) + " " + name + "@" + version)

			i++
		}
	}

	/* Removing the `.flight` directory. */
	os.Remove("./.flight")

	jsonData, _ := json.Marshal(pkgJson)
	jsonData, _ = json.MarshalIndent(pkgJson, "", "\t")
	ioutil.WriteFile("./package.json", jsonData, os.ModePerm)
}

func Install(pkgs []string) {
	for i := 0; i < len(pkgs); i++ {
		/* Getting the url of the package that is being installed. */
		url := fmt.Sprintf("https://registry.yarnpkg.com/%v", pkgs[i])

		/* Getting the response from the url and reading the body of the response. */
		resp, err := http.Get(url)
		if err != nil {
			fmt.Println(err)
		}

		defer resp.Body.Close()

		body, err := ioutil.ReadAll(resp.Body)

		if err != nil {
			fmt.Println(err)
		}

		/* Getting the version of the package that is being installed. */
		var data map[string]interface{}
		json.Unmarshal(body, &data)

		var version string
		for _, v := range data["dist-tags"].(map[string]interface{}) {
			version = v.(string)
		}

		/* Creating the directories `.flight` and `node_modules` in the current directory. */
		os.Mkdir("./.flight", os.ModePerm)
		os.Mkdir("./node_modules", os.ModePerm)

		/* Downloading the package from the url and saving it to the `.flight` directory. */
		name := data["name"].(string)
		fileUrl := fmt.Sprintf("https://registry.yarnpkg.com/%v/-/%v-%v.tgz", name, name, version)
		err = downloadFile(fmt.Sprintf("./.flight/%s.tgz", name), fileUrl)

		if err != nil {
			panic(err)
		}

		/* Extracting the downloaded tarball into the `node_modules` directory. */
		err = targz.Extract(fmt.Sprintf("./.flight/%s.tgz", name), "./node_modules/")

		if err != nil {
			fmt.Println(color.Bold.Text(color.BgRed.Text("Error:")) + " " + "Could not extract " + name + "@" + version)
		}

		/* Renaming the directory `package` to the name of the package. */
		err = os.Rename("./node_modules/package", fmt.Sprintf("./node_modules/%s", name))

		/* Checking if the package is already installed and if it is, it will remove the `.flight` directory
		and the `package` directory in the `node_modules` directory. If it is not installed, it will print
		that the package is installed and remove the `.flight` directory. */
		if err != nil {
			fmt.Println(color.Bold.Text(color.BgRed.Text("Error:")) + " " + fmt.Sprintf("Package \"%s\" already exists/could not be installed.", name))
			os.RemoveAll("./.flight")
			os.RemoveAll("./node_modules/package")
			os.Exit(0)
		} else {
			fmt.Println(color.Bold.Text(color.Green.Text("Installed")) + " " + name + "@" + version)
			os.RemoveAll("./.flight")
		}
	}

}

func downloadFile(filepath string, url string) error {

	/* Downloading the file from the url and returning an error if there is one. */
	resp, err := http.Get(url)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	/* Creating a file with the name of the filepath and returning an error if there is one. */
	out, err := os.Create(filepath)
	if err != nil {
		return err
	}
	defer out.Close()

	/* Copying the response body into the file. */
	_, err = io.Copy(out, resp.Body)
	return err
}
