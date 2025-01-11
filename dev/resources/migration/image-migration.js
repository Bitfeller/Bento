const fs = require('fs');
const path = require('path');

const directoryPath = '.';

// Read the directory
fs.readdir(directoryPath, (err, files) => {
    if (err) {
        return console.log('Unable to scan directory: ' + err);
    }

    // Loop through all the files in the directory
    files.forEach((file) => {
        // Check if the file has the .deckpic extension
        if (path.extname(file) === '.pfp') {
            // Extract only the numbers from the file name
            const newFileName = file.replace(/\D/g, '') + '.pic';
            const oldFilePath = path.join(directoryPath, file);
            const newFilePath = path.join(directoryPath, newFileName);

            // Rename the file
            fs.rename(oldFilePath, newFilePath, (err) => {
                if (err) {
                    console.log('Error renaming file: ' + err);
                } else {
                    console.log(`Renamed: ${file} -> ${newFileName}`);
                }
            });
        }
    });
});