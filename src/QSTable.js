/*globals define*/
define( ["qlik", "jquery", "text!./style.css"], function ( qlik, $, cssContent ) {
	'use strict';
	$( "<style>" ).html( cssContent ).appendTo( "head" );

	function getAppBaseURL () {
	  var config = {
		host: window.location.hostname,
		prefix: window.location.pathname.substr(0, window.location.pathname.toLowerCase().lastIndexOf("/extensions") + 1),
		port: window.location.port,
		isSecure: window.location.protocol === "https:"
	  };
	  // Open a connection to QRS
	  var global = qlik.getGlobal(config);

	  var isDesktop = (config.port == "4848");	
	  var appPathEncoded = "";

	  // Get the app path for Qlik Sense Desktop
	  if (isDesktop) { 
		var app = qlik.currApp(this);
		var applicationId = app.id;
		if(applicationId!=null){            
		  applicationId = applicationId.slice(0, applicationId.lastIndexOf("\\")+1);
		  appPathEncoded = encodeURIComponent(applicationId);
		};
	  }

	  return (config.isSecure ? "https://" : "http://" ) + config.host + (config.port ? ":" + config.port : "" ) + "/sense/app/" + appPathEncoded;
	};


	
	function  createTotal ( rows, dimensionInfo, measureInfo, labelTotal, totalTopBottom ) {

		var html = "";
		var ImgURL="/extensions/QSTable/images/"; 
		
		var AppBaseURL = getAppBaseURL();

	
		var tdTotal = "<tr>";
		
		if (labelTotal === undefined )
			var tdTotalLabel="Total";
		else 
			var tdTotalLabel=labelTotal;

		
		for(var i = 0;  i<dimensionInfo.length;i++){			
			if(i==0)
				tdTotal=tdTotal+"<td class='total"+"'>" + tdTotalLabel + '</td>';
			else
				tdTotal=tdTotal+"<td class='total"+"'>" + '</td>';
		}
		var hasTotal=false;
		for(var i =0; i< measureInfo.length;i++){
			tdTotal += "<td class='";
			if ( !isNaN( measureInfo[i].qMax ) ) {
					tdTotal += "numeric ";
			}
			if(measureInfo[i].totalMeasure===undefined){
				tdTotal += "'> </td>";
			}
			else 
			{
			  if(measureInfo[i].totalMeasure !== "")
				hasTotal=true;
			  if(~measureInfo[i].totalMeasure.toLowerCase().indexOf('<img>')){
				tdTotal += "image'"+'> <img src="'+ ImgURL + measureInfo[i].totalMeasure.slice(5, measureInfo[i].totalMeasure.length) + '" height=' + '15' + '></td>';
			  }
			  else if(~measureInfo[i].totalMeasure.toLowerCase().indexOf('<url>')){
				var urlmark = measureInfo[i].totalMeasure.toLowerCase().indexOf('<url>');
				tdTotal += "'"+'> <a href="' + measureInfo[i].totalMeasure.slice(urlmark+5, measureInfo[i].totalMeasure.length) + '" target="_blank">' + measureInfo[i].totalMeasure.slice(0,urlmark) + '</a></td>';
			  }
			  else if(~measureInfo[i].totalMeasure.toLowerCase().indexOf('<app>')){
				var urlmark = measureInfo[i].totalMeasure.toLowerCase().indexOf('<app>');
				tdTotal += "'"+'> <a href="' + AppBaseURL + measureInfo[i].totalMeasure.slice(urlmark+5, measureInfo[i].totalMeasure.length) + '" target="_blank">' + measureInfo[i].totalMeasure.slice(0,urlmark) + '</a></td>';
			  }
			  else {
				tdTotal += "'>" + measureInfo[i].totalMeasure + '</td>';
			  }
			}
		}
		tdTotal+="</tr>";
		if(hasTotal)
			return tdTotal;
		else
			return "";
		
		
	}
	
	
	
	function createRows ( rows, dimensionInfo, measureInfo, labelTotal, totalTopBottom ) {;
		var ImgURL="/extensions/QSTable/images/"; 
		
		var AppBaseURL = getAppBaseURL();
		

		
		var htmlRows="";
		
		rows.forEach( function ( row ) {
			htmlRows+="<tr>";
			row.forEach( function ( cell, key ) {
				if ( cell.qIsOtherCell ) {
					cell.qText = dimensionInfo[key].othersLabel;
				}
			//	console.log (cell);
			//	console.log (key);
			//  console.log (dimensionInfo[key]);
				
				
				//measure columns
				htmlRows += "<td ";
				//add  style defined for a dimension or a measure
				if (cell.qAttrExps) {
					if (cell.qAttrExps.qValues[0].qText) {
					htmlRows += "style = '"+cell.qAttrExps.qValues[0].qText+"'";
					}
				};
				htmlRows += " class='";
				if ( !isNaN( cell.qNum ) ) {
					htmlRows += "numeric ";
				}
				if (cell.qText === undefined) {
				htmlRows += "'> </td>";
				}
				else 
				{
				if(~cell.qText.toLowerCase().indexOf('<img>')){
					htmlRows += "image'"+'> <img src="'+ ImgURL + cell.qText.slice(5, cell.qText.length) + '" height=' + '15' + '></td>';
				}
				else if(~cell.qText.toLowerCase().indexOf('<url>')){
					var urlmark = cell.qText.toLowerCase().indexOf('<url>');
					htmlRows += "'"+'> <a href="' + cell.qText.slice(urlmark+5, cell.qText.length) + '" target="_blank">' + cell.qText.slice(0,urlmark) + '</a></td>';
				}
				else if(~cell.qText.toLowerCase().indexOf('<app>')){
					var urlmark = cell.qText.toLowerCase().indexOf('<app>');
					htmlRows += "'"+'> <a href="' + AppBaseURL + cell.qText.slice(urlmark+5, cell.qText.length) + '" target="_blank">' + cell.qText.slice(0,urlmark) + '</a></td>';
				}
				else {
					
					if (dimensionInfo[key]) {
						htmlRows += "selectable' ";
						htmlRows += " dim-col='" + key + "'" ;
						htmlRows += " dim-index='" + cell.qElemNumber  + "'" ;
					}
					
					htmlRows += "'>" + cell.qText + '</td>';
				};
				
				};
			} );
			htmlRows += '</tr>';
		} );
		
		return htmlRows;
	}
	
/**
	 * Set column to be first in sort order
	 * @param self The extension
	 * @param col Column number, starting with 0
	 */
	function setSortOrder ( self, col ) {
		//set this column first
		var sortorder = [col];
		//append the other columns in the same order
		self.backendApi.model.layout.qHyperCube.qEffectiveInterColumnSortOrder.forEach( function ( val ) {
			if ( val !== sortorder[0] ) {
				sortorder.push( val );
			}
		} );
		self.backendApi.applyPatches( [{
			'qPath': '/qHyperCubeDef/qInterColumnSortOrder',
			'qOp': 'replace',
			'qValue': '[' + sortorder.join( ',' ) + ']'
		}], true );
	}

	/**
	 * Reverse sort order for column
	 * @param self The extension
	 * @param col The column number, starting with 0
	 */
	function reverseOrder ( self, col ) {
		var hypercube = self.backendApi.model.layout.qHyperCube;
		var dimcnt = hypercube.qDimensionInfo.length;
		var reversesort = col < dimcnt ? hypercube.qDimensionInfo[col].qReverseSort :
			hypercube.qMeasureInfo[col - dimcnt].qReverseSort;
		self.backendApi.applyPatches( [{
			'qPath': '/qHyperCubeDef/' +
			( col < dimcnt ? 'qDimensions/' + col : 'qMeasures/' + ( col - dimcnt ) ) +
			'/qDef/qReverseSort',
			'qOp': 'replace',
			'qValue': ( !reversesort ).toString()
		}], true );
	}

	function formatHeader ( col, value, sortorder ) {
		var html =
			'<th data-col="' + col + '">' + value.qFallbackTitle ;
		//sort Ascending or Descending ?? add arrow
		if(value.qSortIndicator === 'A' || value.qSortIndicator === 'D') {
			html += (value.qSortIndicator === 'A' ? "<i class='icon-triangle-top" : "<i class='icon-triangle-bottom");
			if ( sortorder && sortorder[0] !== col ) {
				html += " secondary";
			}
			html += "'></i>";
		}
		html += "</th>";
		return html;
	}

	
	var labelTotal = {
			type: "string",
			label: "Total Label",
			ref: "labelTotal",
			//expression: "always",
			defaultValue: "Total"
			
	};

	var totalTopBottom = {
		type: "string",
		component: "switch",
		label: "Totals on Top/Bottom",
		ref: "totalTopBottom",
		options: [{
			value: "top",
			label: "Top"
		}, {
			value: "bottom",
			label: "Bottom"
		}],
		defaultValue: "top"
	};	
	
	var tableSelectonDimensions = {
		type: "string",
		component: "switch",
		label: "Select on Dimensions",
		ref: "tableSelectonDimensions",
		options: [{
			value: "no",
			label: "No"
		}, {
			value: "yes",
			label: "Yes"
		}],
		defaultValue: "no"
	};	

	var options = {
					type:"items",
					//component: "expandable-items",
					label:"Opções",
					items: {			
						labelTotal:labelTotal,
						totalTopBottom:totalTopBottom,
						tableSelectonDimensions:tableSelectonDimensions
					}
			
				}

	return {
		initialProperties: {
			qHyperCubeDef: {
				qDimensions: [],
				qMeasures: [],
				qInitialDataFetch: [{
					qWidth: 10,
					qHeight: 50
				}]
			}
		},
		definition: {
			type: "items",
			component: "accordion",
			items: {
				dimensions: {
					uses: "dimensions",
					min: 1,
					items: {
						styleDimension: {
							type: "string",
							component: 'expression',
							ref: "qAttributeExpressions.0.qExpression",
							label: "Style",
							expression: ""
						}
					}
				},
				measures: {
					uses: "measures",
					min: 0,
					items: {
						totalMeasure: {
									type: "string",
									ref: "qDef.totalMeasure",
									label: "Total Expression",
									expression: "always",
									defaultValue: ""
								},
						styleMeasure: {
							type: "string",
							component: 'expression',
							ref: "qAttributeExpressions.0.qExpression",
							label: "Style",
							expression: ""
						}
					}
				},
				sorting: {
					uses: "sorting"
				},
				settings: {
					uses: "settings"
				},
				options:options
			}
		},
		snapshot: {
			canTakeSnapshot: true
		},
		paint: function ( $element, layout ) {
			var html = "<table><thead><tr>", self = this,
				morebutton = false,
				hypercube = layout.qHyperCube,
				rowcount = hypercube.qDataPages[0].qMatrix.length,
				dimcount = hypercube.qDimensionInfo.length,
				colcount = hypercube.qDimensionInfo.length + hypercube.qMeasureInfo.length,
				sortorder = hypercube.qEffectiveInterColumnSortOrder;
			
			
		//	console.log(hypercube);
				
			//render titles
//			hypercube.qDimensionInfo.forEach( function ( cell ) {
				//html += '<th>' + cell.qFallbackTitle + '</th>';
//			} );
            hypercube.qDimensionInfo.forEach(function(value, col) {
                html += formatHeader(col, value, sortorder);
            });

//			hypercube.qMeasureInfo.forEach( function ( cell ) {
				//html += '<th>' + cell.qFallbackTitle + '</th>';
            hypercube.qMeasureInfo.forEach(function(value, col) {
                html += formatHeader(col + dimcount, value, sortorder);
			} );
			html += "</tr></thead><tbody>";
			//render data
			
			//calculate totals
			var htmlTotal=createTotal( hypercube.qDataPages[0].qMatrix, hypercube.qDimensionInfo,hypercube.qMeasureInfo,layout.labelTotal,layout.totalTopBottom);
			
			//create array to put  in  table(can be more with button "more")
			var htmlArray=[];

			//push first results on array
			htmlArray.push(createRows( hypercube.qDataPages[0].qMatrix, hypercube.qDimensionInfo,hypercube.qMeasureInfo,layout.labelTotal,layout.totalTopBottom));
			
			
			
			//html += createRows( hypercube.qDataPages[0].qMatrix, hypercube.qDimensionInfo,hypercube.qMeasureInfo,layout.labelTotal,layout.totalTopBottom);
			html += "</tbody></table>";
			//add 'more...' button
			if ( hypercube.qSize.qcy > rowcount ) {
				html += "<button class='more'>More...</button>";
				morebutton = true;
			}
			//create empty table
			$element.html( html );
			
			//create
			html="";
			for(var i = 0;i<htmlArray.length;i++)
				html+=htmlArray[i];
			
			//insert Total
			if(layout.totalTopBottom=="top")
				html=htmlTotal+html;
			else
				html=html+htmlTotal;
			
			//insert table 
			$element.find( "tbody" ).html( html );
			
			
			if ( morebutton ) {
				$element.find( ".more" ).on( "qv-activate", function () {
					var requestPage = [{
						qTop: rowcount,
						qLeft: 0,
						qWidth: colcount,
						qHeight: Math.min( 50, hypercube.qSize.qcy - rowcount )
					}];
					self.backendApi.getData( requestPage ).then( function ( dataPages ) {
						rowcount += dataPages[0].qMatrix.length;
						if ( rowcount >= hypercube.qSize.qcy ) {
							$element.find( ".more" ).hide();
						}
						
						
						//push result from more on array;
						htmlArray.push(createRows( dataPages[0].qMatrix, hypercube.qDimensionInfo,hypercube.qMeasureInfo,layout.labelTotal,layout.totalTopBottom));
						//var html = createRows( dataPages[0].qMatrix, hypercube.qDimensionInfo,hypercube.qMeasureInfo,layout.labelTotal,layout.totalTopBottom);
						
						//create new html
						var  html="";
						for(var i = 0;i<htmlArray.length;i++)
							html+=htmlArray[i];
						
						//totals
						if(layout.totalTopBottom=="top")
							html=htmlTotal+html;
						else
							html=html+htmlTotal;
						//replace html
						$element.find( "tbody" ).html( html );
					} );
				} );
			}
			
			
			
	/*		$element.find('.selectable').on('qv-activate', function() {
                    if (this.hasAttribute("data-value")) {
                        var value = parseInt(this.getAttribute("data-value"), 10),
                            dim = parseInt(this.getAttribute("data-dimension"), 10);
                        self.selectValues(dim, [value], true);
                        $element.find("[data-dimension='" + dim + "'][data-value='" + value + "']").toggleClass("selected");
                    }
				});
	*/			
				$element.find(".selectable").on("click", function() {
					// Get the dimension column number
					if (layout.tableSelectonDimensions ==='yes') {
					var dimCol = parseInt(this.getAttribute("dim-col"));
					
					// Get the dimension value index
					var dimInd = parseInt(this.getAttribute("dim-index"));
		
					// Call selectValues with these values
					self.selectValues(dimCol, [dimInd],true);
					$element.find("[dim-col='" + dimCol + "'][dim-index='" + dimInd + "']").toggleClass("selected");
					}
				});
                $element.find('th').on('qv-activate', function() {
                    if (this.hasAttribute("data-col")) {
                        var col = parseInt(this.getAttribute("data-col"), 10);
                        setSortOrder(self, col);
                    }
                });
                $element.find('th i').on('qv-activate', function() {
                    var parent = this.parentNode;
                    if (parent.hasAttribute("data-col")) {
                        var col = parseInt(parent.getAttribute("data-col"), 10);
                        reverseOrder(self, col);
                    }
                });
			return qlik.Promise.resolve();
		}
	};
} );
