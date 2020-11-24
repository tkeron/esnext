# TKERON-ESNEXT

> This module allows you to transform your transpiled javascript
code by adding the extension ".js" to the local imports, 
preferably always use the notation "./" and "../" to import 
local modules, then you can use it in the browser or with nodejs.

Example:

> tkeron-esnext myfolder-with-tsc-output-files

You can add the "cacheBuster" command to add a timestamp as get
param, and avoid browser cache:

> tkeron-esnext myfolder-with-tsc-output-files cacheBuster