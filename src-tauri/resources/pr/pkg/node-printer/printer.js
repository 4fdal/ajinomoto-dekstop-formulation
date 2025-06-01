const ThermalPrinter = require("node-thermal-printer").printer;
const Types = require("node-thermal-printer").types;

async function printMsg(msg) {
    let epsonThermalPrinter = new ThermalPrinter({
        type: Types.EPSON,
        width: 10,
        characterSet: 'SLOVENIA',
        removeSpecialCharacters: false,
        lineCharacter: "-",
    });

    epsonThermalPrinter.alignCenter();

    epsonThermalPrinter.printQR(msg, {
        cellSize: 8,
        correction: 'Q',
        model: 2
    });
    epsonThermalPrinter.alignLeft();


    return epsonThermalPrinter.getBuffer().toString(); // Return the buffer as string
}

async function main() {
    const result = await printMsg(process.argv[2]);
    console.log(result); // Output the result
}

// Call the main function
main().catch(error => console.error(error));
