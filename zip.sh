#!/usr/bin/env sh

PKG_NAME=`node -p "require('./package.json').name"`

if [[ -z $PACKAGE_SUFFIX ]]; then
  ZIP_FILE=$PKG_NAME.zip
else
  ZIP_FILE=$PKG_NAME$PACKAGE_SUFFIX.zip
fi

# introduce an intermediary folder so unzipper need not unzip -d
# NOTE: all files in root containing a leading '.' are excluded
mkdir .$PKG_NAME
mv * .$PKG_NAME
mv .$PKG_NAME $PKG_NAME
# restore the logs to their original location for test result reporting purposes
mv $PKG_NAME/logs .
mv $PKG_NAME/coverage .

# bin + tools aren't present in the template repo,
#  but devs typically add them to help with development.
#  prune them from the artifact so they do not get pushed or get analyzed by code smell tools like checkmarx
zip -r $ZIP_FILE $PKG_NAME \
  -x "$PKG_NAME/Jenkinsfile" \
  -x "$PKG_NAME/*.sh" \
  -x "$PKG_NAME/package-lock.json" \
  -x "$PKG_NAME/test*" \
  -x "$PKG_NAME/bin*" \
  -x "$PKG_NAME/tools*" \
  -x "$PKG_NAME/config*"

# now that the zip has been created, move package.json back to root
# for other build tasks
mv $PKG_NAME/package.json .
