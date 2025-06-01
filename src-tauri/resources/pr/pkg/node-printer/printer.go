package nodePrinter

import (
	"fmt"
	"os/exec"
)

func QrGenerator(msg string) []byte {
	// Path to your JavaScript file
	jsFilePath := "pkg/node-printer/printer.js" // Assuming both files are in the same directory

	// Arguments to pass to the JavaScript file
	jsArgs := []string{msg}

	// Command to execute the JavaScript file
	cmd := exec.Command("node", append([]string{jsFilePath}, jsArgs...)...)

	// Capture standard output and standard error
	output, err := cmd.CombinedOutput()
	if err != nil {
		// Print standard error output
		fmt.Println("Error executing JavaScript file:", err)
		fmt.Println("Standard error output:", string(output))
		return nil
	}

	// Output of the JavaScript file
	fmt.Println("Output of JavaScript file:", string(output))
	return output
}
