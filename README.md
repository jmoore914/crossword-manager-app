# crossword-manager-app

Electron/Vue app for downloading and launching crosswords in the .puz file type.

![Screenshot](/public/screenShot.png?raw=true)

TODO:
- Integrate  dialog for logging into NYT and extracting the necessary cookies
- Properly type NYT json


## Installation


To launch the app, run the following commands:


``` 
git clone https://github.com/jmoore914/crossword-manager-app.git
cd cross-manager-app
npm i
npm run dev
```


# Acknowledgements

Huge props to the following who made this app possible:

Andrew Hyndman - His excellent work in his [puz](https://github.com/ajhyndman/puz) project is used to encode puzzles into the Across Lite .puz format.

 Parker Higgins - [xlword-dl](https://github.com/thisisparker/xword-dl) was the basis for decoding the obfuscated/encoded puzzles from Amuselabs.