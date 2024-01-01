# 
# Sets up the server.
# Some processes, like starting server-notif-main.js, are done by the server handler.
# 


# Remove unwanted files
rm ./server/conf/local-config.json
rm -rf ./dev
rm -rf ./site/test
rm -rf ./sitejs/test-scripts
rm -rf ./server/todo.md

rm ./.htaccess
rm ./.gitignore
rm ./.gitattributes
rm -r *.md

mv ./_server_.htaccess ./.htaccess

rm -rf ./db


# Create filter regex words
cd ./server/conf/moderator

#   Get filter words
wget https://raw.githubusercontent.com/LDNOOBW/List-of-Dirty-Naughty-Obscene-and-Otherwise-Bad-Words/master/en -O config-filter.list

node ./static/genregex.js
rm config-filter.list
rm ./static -R
cd ../../..


# Install Node.js dependencies and remove other files
cd ./server/notif-service
npm install
rm _DEPRECATED
rm "_TODO!"
touch sub-save.json