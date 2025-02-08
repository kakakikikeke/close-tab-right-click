rm -rf dist/*
mkdir -p dist
zip -r -FS ./dist/close-tab-right-click.zip * --exclude '*.git*' '*package.json*' '*node_modules*' 'build.sh' '.eslintrc.js' '*dist*'
