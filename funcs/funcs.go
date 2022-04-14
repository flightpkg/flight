package flight

import (
	"fmt"

	color "github.com/fatih/color"
)

func Log(input string) {
	fmt.Println(color.RedString("Flight: ") + input)
}
