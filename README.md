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

		=if(Type='GB','\<img>arrow_upward_black.png','\<img>arrow_downward_black.png')
		

		=if(sum(Actual)/sum(Target)\<0.8,'\<img>led_red.png', if(sum(Actual)/sum(Target)\<1,'\<img>led_yellow.png','\<img>led_green.png'))

* enable a hyperlink to open an App

        ='Open App<app>'&App

* enable a hyperlink to open an external page

        ='Open URL<url>'&URL
	
* You can play with the css file to adjust color, font size, borders of the object
	
	
## Compatibility
**QSTable** is designed to work with Qlik Sense 3.0.x or higher. It will not work in older versions.

## Room for improvement / contribution
* Mix image and target URL in the same column
* Responsive layout for small screens
* Freeze header
* Play with the css inside the object

Is there **anything else you'd like to see** in this visualization extension?

* Don't hesitate to add the feature and create a pull request!
* You don't have the time or skills to implement this specific feature? No problem, [drop a note here](https://github.com/stefanwalther/sense-navigation/issues).

## Contributing
Pull requests and stars are always welcome. For bugs and feature requests, [please create an issue](https://github.com/pabloslabbe/QSTable/issues).
The process for contributing is outlined below:

1. Create a fork of the project
2. Work on whatever bug or feature you wish
3. Create a pull request (PR)

I cannot guarantee that I will merge all PRs but I will evaluate them all.

## Author
**Pablo Labbe**

* [ANALITIKA Brasil](http://analitika.com.br) 
* [Linkedin] (https://www.linkedin.com/in/pablolabbe)

## Acknowledge

Many pieces of this project was based or inpired by the work of others developers :

 [Stefan Walther] (https://github.com/stefanwalther) - Documentation
 [Erik Wetterberg] (https://github.com/erikwett/qsDynamicTable)  - Dynamic table
 [Daniel Pilla] (https://github.com/danielpilla/sense-images-links-extension)  - Simple Table with Image/Link Detection
 [Fady Heiba] (https://github.com/fadyheiba/Document-Chaining) - Document Chaining
 
