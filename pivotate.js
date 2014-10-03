var stroke_size_value = 2000;

var pivotate = (function() {

	var _token = null;
	var project_id = null;

    function request( url, options ) {
        
        var params = {
                data        : "",
                headers     : {},
                type        : "POST",
                contentType : "application/x-www-form-urlencoded",
                processData : true,
                dataType    : 'json'
            };

        $.extend(params, options);

        url = "https://www.pivotaltracker.com/services/v5" + url;

        params.headers["Content-Type"] = params.contentType;
        params.headers["X-TrackerToken"] = _token;

        return $.ajax(url, params);
    }

    function getProject() {
    	return $('#project').val()
    }

    function attachment() {
        var CRLF = "\r\n",
            boundary = "AJAX--------------" + (new Date).getTime(),
            send = '--' + boundary
                 + CRLF
                 + 'Content-Disposition: form-data; name="project_id"' + CRLF
                 + CRLF
                 + project_id + CRLF
                 + CRLF
                 + '--' + boundary
                 + CRLF
                 +  'Content-Disposition: form-data; name="file"; filename="screen.png"' + CRLF
                 + 'Content-Type: image/png' + CRLF
                 + CRLF
                 + atob(self.formatIMG.toDataURL().replace(/^data:image\/(png|jpg);base64,/, "")) + CRLF
                 + CRLF
                 + '--' + boundary + "--" + CRLF;

	    var data = new ArrayBuffer( send.length );
	    var ui8a = new Uint8Array( data, 0 );
	    for ( var i = 0; i < send.length; i++ ) {
	        ui8a[i] = ( send.charCodeAt(i) & 0xff );
	    }
	    send = new Blob([data], {type: "image/png"});

      
        return request("/projects/" + project_id + "/uploads", {
            data  : send,
            contentType : "multipart/form-data; boundary=" + boundary,
            processData: false
        });

    }

    function loadProjects () {

		var project = document.querySelector( "#project" );
		var default_project = window.localStorage.getItem( "pivotal-project" );
		project.options.length = 0;
		request("/projects", {
			type: "GET"
		}).done(function( result ) {
			for ( var i = 0, max = result.length; i < max; i++ ) {
			    var option = document.createElement( 'option' );
			    option.text = result[i].name;
			    option.value = result[i].id;
			    if (result[i].id == default_project) option.selected = true;
			    project.add( option, project.options[project.selectedIndex] );
			}
			project_id = project.value;
			loadLabels();
			loadMembers();
		}).fail(function( status, e ) {
			if ( status == 401 ) {
			    self.token.form(function( token ) {
					self.pivotal.setToken( token );
					self.loadProjects();
			    }, "enter a valid token");
			} else {
			    alert( "An unexpected error occurred, sorry" );
			}
	    });
    }

    function loadMembers() {
    	var owners = document.querySelector('#owners');
    	owners.options.length = 0;
		request("/projects/" + project_id + "/memberships", {
			type: "GET"
		}).done(function( result ) {
			for ( var i = 0, max = result.length; i < max; i++ ) {
				if (result[i].person) {
				    var option = document.createElement( 'option' );
				    option.text = result[i].person.name;
				    option.value = result[i].person.id;
				    owners.add( option, owners.options[owners.selectedIndex] );
				}
			}
			$('#owners').trigger("chosen:updated");
		});
    }

    function loadLabels () {
		var self = this,
		    labels = document.querySelector( "#labels" );
		labels.options.length = 0;
    	request("/projects/" + project_id + "/labels", {
            type: "GET"	    		
    	}).done(function(result){
			for ( var i = 0, max = result.length; i < max; i++ ) {
			    var option = document.createElement( 'option' );
			    option.text = result[i].name;
			    option.value = result[i].id;
			    labels.add( option, labels.options[labels.selectedIndex] );
			}
	    	$('#labels').trigger("chosen:updated");
    	});
    }

    function addStory(attach) {
		var name = document.querySelector( "#name" ),
			description = document.querySelector( "#description" ),
			storyType = document.querySelector( "#story_type" );

    	var data = {
				name        : name.value,
				description : description.value,
				story_type  : storyType.value,
				project_id  : project_id,
				comments	: [
					{
						text: self.url,
						file_attachments: [attach]
					}					
				]
			}
			
		if (labels = $("#labels").val()) {
			for (var i=0; i<labels.length; i++) labels[i] = labels[i] * 1;
			data.label_ids = labels;
		}
		if (owners = $("#owners").val()) {
			for (var i=0; i<owners.length; i++) owners[i] = owners[i] * 1;
			data.owner_ids = owners;
		}

		return request("/projects/" + project_id + "/stories", {
			data: JSON.stringify(data),
            contentType: 'application/json'
		});
    }
	
	 function clean_canvas(){
	    var screenshot = window.sessionStorage.getItem( "img-" + self.params.id );
	    if ( screenshot ) {
	 	    self.formatIMG.fromDataURL(screenshot);
	    }
	 }
	 
	 function changeStrokeSize(direction){

		 if(direction == "up") {
			 stroke_size_value += 500;
			 return stroke_size_value;
		 } else if(direction == "down"){
		    stroke_size_value -= 500;
			 return stroke_size_value;
		 };
	 }

	var self = {
		url: '',
		formatIMG: null,
		params: null,
	    load : function( params ) {
	    
			var project = document.querySelector( "#project" ),
				 icons = document.querySelectorAll( '.story .icons > li' ),
			    canvas = document.querySelector( "#canvas-background" ),
			    storyType = document.querySelector( "#story_type" ),
			    action = document.querySelector( "#action" ),
			    name = document.querySelector( "#name" ),
			    labels = document.querySelector("#labels"),
			    description = document.querySelector( "#description" );


			canvas.setAttribute( "height",  ( window.innerHeight - 125 ) + "px" );
			canvas.setAttribute( "width", ( window.innerWidth - 305 ) + "px" );
			
			
			// brushes 
			
    	  	var draw_icons = document.querySelectorAll( '.story #brushes > li' );

			self.formatIMG = c;
			var tool = 'rectangle'; // default selection
			self.formatIMG.setTool(tool);
			
			for ( var i = 0, max = draw_icons.length; i < max; i++ ) {
			   				 
			    draw_icons[i].addEventListener( 'click', function() {
					for ( var y = 0, max = draw_icons.length; y < max; y++ ) {
					    var draw_iconsDisable = draw_icons[y];
					    draw_iconsDisable.className = draw_iconsDisable.getAttribute( "data-drawtool" );
					}
			    
					this.className += " active";
					tool = this.getAttribute( "data-drawtool" );
					self.formatIMG.setTool(tool);
					
			    });
			};
							
			self.params = params || {};
		
			$( "#panel" ).attr('style', "width: 300px; height: " + ( window.innerHeight - 22 ) + "px");

			self.token.get();

			document.querySelector( "#set-token" ).addEventListener( 'click', function() {
			   self.token.form();
			});
		
			document.querySelector("#undo").addEventListener('click', function() {
  	 	    	self.formatIMG.undo();
			});
		
			document.querySelector("#redo").addEventListener('click', function() {
  	 	    	self.formatIMG.redo();
			});
		
			document.querySelector("#bin").addEventListener('click', function() {
				clean_canvas();
			});
		
			document.querySelector("#minus").addEventListener('click', function() {
				self.formatIMG.setStrokeSize(changeStrokeSize('down'));
			});
		
			document.querySelector("#plus").addEventListener('click', function() {
				self.formatIMG.setStrokeSize(changeStrokeSize('up'));
			});
			
			self.formatIMG.setStrokeSize(stroke_size_value);
			// Editor Tools
			
    	  	var color_icons = document.querySelectorAll( '.story #editor > li' );			
			
			// colors
			
    	  	var color_icons = document.querySelectorAll( '.story #colors > li' );			
			var default_color = 'red'; // default selection
			var color_map = new Array();
			color_map['red'] = '#FF0000';
			color_map['yellow'] = '#FFFF00';
			color_map['green'] = '#00FF00';
			color_map['blue'] = '#0000FF';
			color_map['magenta'] = '#FF00FF';
			color_map['cyan'] = '#00FFFF';
			color_map['black'] = '#000000';
			color_map['white'] = '#FFFFFF';
			
			self.formatIMG.setColor('#ec823f');(default_color);
			
			for ( var i = 0, max = color_icons.length; i < max; i++ ) {
			   				 
			    color_icons[i].addEventListener( 'click', function() {
					for ( var y = 0, max = color_icons.length; y < max; y++ ) {
					    var color_iconsDisable = color_icons[y];
					    color_iconsDisable.className = color_iconsDisable.getAttribute( "data-colortool" );
					}
			    
					this.className += " active";
					colorvalue = this.getAttribute( "data-colortool" );
					
					self.formatIMG.setColor(color_map[colorvalue]);
					
			    });
			};
							
			self.params = params || {};
		
			$( "#panel" ).attr('style', "width: 300px; height: " + ( window.innerHeight - 22 ) + "px");

			self.token.get();

			document.querySelector( "#set-token" ).addEventListener( 'click', function() {
			   self.token.form();
			});
		
			document.querySelector("#clean").addEventListener('click', function() {
			    var screenshot = window.sessionStorage.getItem( "img-" + self.params.id );
			    if ( screenshot ) {
					self.formatIMG.fromDataURL(screenshot);
			    }
			});
			

			// storytypes
			
			for ( var i = 0, max = icons.length; i < max; i++ ) {
			    
			    icons[i].addEventListener( 'click', function() {
					for ( var y = 0, max = icons.length; y < max; y++ ) {
					    var iconDisable = icons[y];
					    iconDisable.className = iconDisable.getAttribute( "data-storytype" );
					}
			    
					this.className += " active";
					storyType.value = this.getAttribute( "data-storytype" );
			    });
			};

	    	$('#labels').chosen();
	    	$('#owners').chosen();
			project.addEventListener('change', function() {
				project_id = this.value;
				window.localStorage.setItem( "pivotal-project", project_id);
				loadLabels();
				loadMembers();
			});
		
	       	action.addEventListener('click', function() {

			    if (name.value == "" || description.value == "" || storyType.value == "") {
					alert( 'All fields are required' );
					return;
			    }
			    
			    this.className += " btn-loading";
			    this.setAttribute( "disabled", true );
			    
			    attachment()
			    .done(function(result){
			    	addStory(result)
			    	.done(function(){
			    		alert("Pivotal story created");
			    		window.close();
			    	})
			    	.fail();
			    })
			    .fail(function(){
		    		action.className = "btn";
		    		action.setAttribute( "disabled", false );
					if (status == 401) {
			    		self.token.form( null, "enter a valid token") ;
					} else {
			    		alert( "An unexpected error occurred, sorry" );
					}			    	
			    });

			});
	       
			var screenshot = window.sessionStorage.getItem( "img-" + this.params.id );
			if ( screenshot ) {
			    this.formatIMG.fromDataURL( screenshot );
			}
		
			window.onresize = function() {
			    var currentImg = self.formatIMG.toDataURL();
			    canvas.setAttribute( "height",  ( window.innerHeight - 125 ) + "px" );
			    canvas.setAttribute( "width", ( window.innerWidth - 305 ) + "px" );
			    self.formatIMG.fromDataURL( currentImg );
			}
	    },
	    
	    setScreenShot: function( img, id ) {
			window.sessionStorage.setItem( "img-" + id, img );
			if ( this.formatIMG ) {
			    this.formatIMG.fromDataURL( img );
			}
	    },

	    setTabData: function(data) {
	    	self.url = data.url;

	    },
	    token : {

			form : function( callback, alert ) {
			    
			    $( "#lockscreen, #show-token" ).show();

			    if ( alert ) $( ".error" ).show().html(alert);

			    $( "#save-token" ).click(function() {
					
					var token = document.querySelector( "#token" ).value;
					if ( token == "" ) {
						$( ".error" ).show(); 
					} else {
						$( ".error" ).hide();
						window.localStorage.setItem( "pivotal-api-token", token );
						
						$( "#lockscreen, #show-token" ).hide();
						_token = token;
						loadProjects();
					}
			    });
			},

			get : function( ) {
			    var token = window.localStorage.getItem( "pivotal-api-token" );
			    if ( !token ) {
					return this.form();
			    }			    
			    _token = token;
			    loadProjects();
			}
	    }		
	};
	return self;
})();

window.addEventListener("load", function() {
    var urlParams = {};
    location.search.slice(1).split("&").forEach(function(param) {
	current = param.split("=", 2);
	urlParams[decodeURIComponent(current[0])] = decodeURIComponent(current[1]);
    });
    pivotate.load(urlParams);
    
}, false);
