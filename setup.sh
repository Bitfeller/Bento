# 
# Sets up server for production.
# Some processes, like starting server-notif-main.js, are done by the server handler.
# 


# =================== Folder Struct ===================
# Remove unwanted files
rm ./server/conf/local-config.json
rm ./server/conf/config.json
cp ../config.json ./server/conf/config.json
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


# =================== Filter Words ===================
# Create filter regex words
cd ./server/conf/moderator

#   Get filter words
wget https://raw.githubusercontent.com/LDNOOBW/List-of-Dirty-Naughty-Obscene-and-Otherwise-Bad-Words/master/en -O config-filter.list

node ./static/genregex.js
rm config-filter.list
rm ./static -R
cd ../../..


# =================== Node ===================
# Install Node.js dependencies
cd ./server/node
npm install

rm -R README.md

cd logs
touch backup.log
touch misc.log
touch notif-service.log
touch sql.log
touch suspend-server.log
cd ..

cd ../..


# =================== Node.js ===================
# Install Node.js dependencies and remove other files
cd ./server/notif-service
npm install
rm "_DEPRECATED"
rm "_TODO!"
touch sub-save.json
cd ../..


# =================== PHPMailer ===================
# Go to php-db/lib
cd ./server/php-db/lib
rm * -R

# Install composer
php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');"
php -r "if (hash_file('sha384', 'composer-setup.php') === 'dac665fdc30fdd8ec78b38b9800061b4150413ff2e3b6f88543c636f7cd84f6db9189d43a81e5503cda447da73c7e5b6') { echo 'Installer verified'; } else { echo 'Installer corrupt'; unlink('composer-setup.php'); } echo PHP_EOL;"
php composer-setup.php
php -r "unlink('composer-setup.php');"

# Install phpmailer
php composer.phar require phpmailer/phpmailer

# Remove composer-generated files
rm composer*

# Move phpmailer to temp and remove vendor
mv vendor/phpmailer ./temp
rm vendor -R

# Get real phpmailer in lib
mv temp/phpmailer .
rm temp -R

# Remove files not needed
rm phpmailer/*.md
rm phpmailer/.editorconfig