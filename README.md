![Bento Logo](https://github.com/Bitfeller/Bento/blob/main/img/bento%20logo%20white.svg?raw=true)
# Bento! (https://bento-app.uk)
### *"learning accelerated"*
A learning webapp using the magical powers of **SRS** (and other systems) along with special magic to make it feel just like an everyday meal...
## Feature List
- Specialty developed SRS system 
- Large selection of learning methods
- Convenient JSON-defined set development
- Light and fast
- User-developed settings 
- Unique bento-based UI
## Project Details
- Mostly written in plain HTML (in PHP files to quickly import stuff), CSS, and JS.
- Backend includes PHP and Node.js code.
- All decks and user data are stored in the MySQL server or in the file server with legible JSON.
- Bash is used to set up the server (because we run Debian on the production server).
## Repository Structure
- `main` - the master branch holding code that is deployed on the main production server.
    - Depending on the last merge/authorized commit, there may be some minor differences between the master branch and the server.
    - All merges (from dev) and related authorized commits will be deployed to the server (through the workflow).
- `dev` - new commits that are still under development or unstable.
    - dev is merged into main periodically with every release.
- All commits must be made to another branch. Only authorized contributors with a valid reason may write authorized commits to either `main` or `dev`.
## Local Environments
- **Note** - the following tutorial is for Windows users.
    - If you're a Linux user, you can read through the tutorial and adapt it properly to set up your own local environment.
- Make sure to be on the **right branch** before you continue.
    - Want to see the version currently on the server? Move to `main`.
    - Want to see the latest features not yet on production? Move to `dev`.
    - Maybe there's a branch you're working on (or on someone else's branch) - move to that branch.
- Install XAMPP - specifically Apache and MySQL.
- Run the deployment code under dev/build_env
    - If it doesn't work, don't hesitate! The deployment code under `main` or `dev` usually works.
    - If that doesn't work either...hey, it was Va1ley who told me to write the code in Rust. No one told me to test it thoroughly, either.
    - If you're on Linux, you can look through the source and try to run similar commands to set up your environment.
- Open XAMPP and start Apache (first) and MySQL (second).
- That's it! All edits you make here will automatically be shown in your local Apache server (type `localhost` in your browser).
## How to Commit
- **Branch** either `main` or `dev`.
    - **Your branch name must follow the proper naming scheme.** Refer to `Naming Scheme` for more info.
    - If you're editing anything under .github or modifying files like the README or .gitattributes, branch `main`.
    - Otherwise, if any other file will be modified, branch `dev`.
- Make your related edits, bug fixes, etc.
    - Following project syntax is preferred; comments are helpful.
    - Individual commits do not need a proper commit title or description! Most of the time, it's best to write a 5-word title and leave the description blank for every description.
- After making your edits, open a PR (pull request) to merge to the proper branch.
    - Give your PR a proper **title**.
    - Make sure to give it a detailed **description** as necessary, so others can understand what you've made.
    - If your PR resolves some issues, it's best to link those issues to your PR so they're closed when your PR is.
        - **Big note** - do not resolve issues your PR fixes before your PR itself is closed.
    - Make sure your PR merges into the right branch - either `main` or `dev`.
        - If your PR doesn't merge into the right branch, it may not be approved at all.
    - Wait a bit! We're always watching so we'll probably notice your PR within a day.
- Once your PR is resolved, it's best practice to delete the branch to clean up any clutter.
#### Project Syntax
- Comments for frontend (this means everything under sitejs) are **highly** encouraged but not required; just remember if you can't understand/explain the code you wrote at 3 A.M. you'll eventually have to write it again.
- Comments for backend or development (everything under dev or server) are **very, extremely highly** encouraged for the purposes of contributors understanding the code before merging it in.
- All front-end elements should follow a consistent design to promote a pleasant experience for the user, furthermore code should be written modularly, and declaratively (as JS allows).
    - Reusing functions over and over? Sounds like you need to write another script to simplify your code...

Have fun learning and writing code!
 ┳━┳ ノ( ゜-゜ノ)


Note: This project is copyrighted by its rightful owners. No one, without the permission of the rightful owners, may adopt this code for themselves.