# 
# Sets up server for production.
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

# Remove all README files
rm -R README.md

# Make sure all log files exist
cd logs
touch backup.log
touch misc.log
touch sql.log
touch suspend-server.log
touch log-collector.log
touch log-collector-info.log
touch error.log
touch error-reports.log
cd ..

# Set normal state for server
echo "0" > ../conf/config-suspend-server

# Start all Node.js scripts individually
cd ./backup && pm2 start ./backup.js --name backup && cd ..
cd ./suspend-server && pm2 start ./suspend-server.js --name suspend-server && cd ..
cd ./log-collector && pm2 start ./log-collector.js --name log-collector && cd ..
cd ./error && pm2 start ./error.js --name error && cd ..
pm2 save

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
php composer.phar require predis/predis

# Remove composer-generated files
rm composer*

# Move phpmailer to temp and remove vendor
mv vendor/phpmailer ./temp
mv vendor/predis ./temp
rm vendor -R

# Get real phpmailer in lib
mv temp/phpmailer .
mv temp/predis .
rm temp -R

# Remove files not needed
rm phpmailer/*.md
rm phpmailer/.editorconfig
rm predis/*.md