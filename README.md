# QSTable
>Another Qlik Sense Table Object
![](https://github.com/PabloSLabbe/QSTable/blob/master/docs/images/Screenshot_QSTable.png)

## Purpose and Description
The Visualization Extension ***QSTable*** for Qlik Sense allows you to add a straight table to a Qlik Sense sheet to show for each row:

* Show images delivered with the extension
* Open a Qlik Sense App poviding name of the QVF (desktop) or ID (server)
* Open an external URL

To use each of them, add to your expression the tag \<img>, \<app>, \<url>

Until now just one tag is supported per expression. You can´t  mix in the same expression an image  and a target url.

## Installation & Download
1. Download the [latest version](https://github.com/PabloSLabbe/QSTable/blob/master/build/QSTable_latest.zip) or [any other version](https://github.com/PabloSLabbe/QSTable/blob/master/build) you want to install.
2. Then install on either *Qlik Sense Desktop* or *Qlik Sense Server*:

* Qlik Sense Desktop
	* To install, unzip all files and copy the content to the folder folder `"C:\Users\%USERNAME%\Documents\Qlik\Sense\Extensions\qstable"`
* Qlik Sense Server
	* See instructions [how to import an extension on Qlik Sense Server](http://help.qlik.com/sense/3.0/en-US/online/#../Subsystems/ManagementConsole/Content/import-extensions.htm)

## Configuration
Drag & drop the object onto a sheet (as you would do it with any other native object or visualization extension).
Then define how the **QSTable** should behave:

* Write an expression to choose an image  to show 

	* if(Type='GB','\<img>arrow_upward_black.png','\<img>arrow_downward_black.png')


