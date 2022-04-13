package main

import (
	"fmt"

	"github.com/fatih/color"
)

func main() {
	version := "0.1.0"
	fmt.Println(color.RedString("Flight") + version)
}
