/*globals define*/
define( ["qlik", "jquery", "text!./style.css", "//cdn.jsdelivr.net/jsbarcode/3.6.0/barcodes/JsBarcode.code39.min.js"], function ( qlik, $, cssContent ) {
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


	function createRows ( rows, dimensionInfo ) {
		var html = "";
		var ImgURL="/extensions/QSTable/images/";

		var AppBaseURL = getAppBaseURL();

		rows.forEach( function ( row ) {
			html += '<tr>';
			row.forEach( function ( cell, key ) {
				if ( cell.qIsOtherCell ) {
					cell.qText = dimensionInfo[key].othersLabel;
				}
				html += "<td class='";
				if ( !isNaN( cell.qNum ) ) {
					html += "numeric ";
				}
				if (cell.qText === undefined) {
				 html += "'> </td>";
				}
				else
				{
					if(~cell.qText.toLowerCase().indexOf('<barcode>')){
					html += "'"+'> <svg class="barcode" jsbarcode-format="code39" jsbarcode-value="' + cell.qText.slice(9, cell.qText.length) + '" jsbarcode-textmargin="0" jsbarcode-fontoptions="bold"></svg></td>';
				  }
				  else if(~cell.qText.toLowerCase().indexOf('<img>')){
					html += "image'"+'> <img src="'+ ImgURL + cell.qText.slice(5, cell.qText.length) + '" height=' + '15' + '></td>';
				  }
				  else if(~cell.qText.toLowerCase().indexOf('<url>')){
					var urlmark = cell.qText.toLowerCase().indexOf('<url>');
					html += "'"+'> <a href="' + cell.qText.slice(urlmark+5, cell.qText.length) + '" target="_blank">' + cell.qText.slice(0,urlmark) + '</a></td>';
				  }
				  else if(~cell.qText.toLowerCase().indexOf('<app>')){
					var urlmark = cell.qText.toLowerCase().indexOf('<app>');
					html += "'"+'> <a href="' + AppBaseURL + cell.qText.slice(urlmark+5, cell.qText.length) + '" target="_blank">' + cell.qText.slice(0,urlmark) + '</a></td>';
				  }
				  else {
					html += "'>" + cell.qText + '</td>';
				  };
				};
			} );
			html += '</tr>';
		} );
		return html;
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
					min: 1
				},
				measures: {
					uses: "measures",
					min: 0
				},
				sorting: {
					uses: "sorting"
				},
				settings: {
					uses: "settings"
				}
			}
		},
		snapshot: {
			canTakeSnapshot: true
		},
		paint: function ( $element, layout ) {
			var html = "<script> JsBarcode('.barcode').init(); </script><table><thead><tr>", self = this,
				morebutton = false,
				hypercube = layout.qHyperCube,
				rowcount = hypercube.qDataPages[0].qMatrix.length,
				dimcount = hypercube.qDimensionInfo.length,
				colcount = hypercube.qDimensionInfo.length + hypercube.qMeasureInfo.length,
				sortorder = hypercube.qEffectiveInterColumnSortOrder;


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
			html += createRows( hypercube.qDataPages[0].qMatrix, hypercube.qDimensionInfo);
			html += "</tbody></table>";
			//add 'more...' button
			if ( hypercube.qSize.qcy > rowcount ) {
				html += "<button class='more'>More...</button>";
				morebutton = true;
			}
			$element.html( html );
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
						var html = createRows( dataPages[0].qMatrix, hypercube.qDimensionInfo );
						$element.find( "tbody" ).append( html );
					} );
				} );
			}
			$element.find('.selectable').on('qv-activate', function() {
                    if (this.hasAttribute("data-value")) {
                        var value = parseInt(this.getAttribute("data-value"), 10),
                            dim = parseInt(this.getAttribute("data-dimension"), 10);
                        self.selectValues(dim, [value], true);
                        $element.find("[data-dimension='" + dim + "'][data-value='" + value + "']").toggleClass("selected");
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
