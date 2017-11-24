Barbarian
==
  This tool that help you include thid-party module of javascript by simple way

# Installation
`$ npm install —global barbarian`

# Usage

## Include Javascript File
include ‘bar.web.js’ to your any html file,  like below

```HTML
<script type='text/javascript' src="path-of-file/bar.web.js"></script>
```
## Require Module

## Configration
You should specify below item before you start to use Barbarian 
- scan — any folders that include javascript<br>
         those files will be scanned if it include `Bar.require(xxx)`<br>
    examples
		    ```JSON
		    "scan": [
		        "public/js"
		        "public/html"   
	    ]
	    ```
- exts -- filter files in the <i>scan</i> folders <br>
          you can use file extension like below
          ```JSON
          "exts":  [
            ".js",
            ".html"
          ]
          ```

I highly recommend you to use config file.
example of config file
```JSON
  "adapter": "bootCDN",
  "scan": [],
  "exts": [
    ".js",
    ".html",
    ".htm",
    ".blade.php"
  ],
  "output": "schemas.bar.json"
}
```