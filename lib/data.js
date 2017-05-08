/**
 * Created by Dai on 3/22/17.
 */
'use strict';

const fs = require( 'fs' ),
      dirPath = require( 'path' ),
      Helper = require( 'underscore' ),
      Libxmljs = require( 'libxmljs' ),
      et = require( 'elementtree' ),
      log = require( './log' ).logger( 'data' );

var DataHelper = ( function( undefined ) {
    var data = function( path ) {
        this.path = path || dirPath.dirname( dirPath.dirname( __filename ) ) + '/data/';
    };

    /**
     * @private
     * @type {{object}}
     */
    var iData = {
        categories: '{"name":"categories","total":0,"categories":[]}',
        articles: '{"name":"articles","total":0,"articles":[]}'
    };

    /**
     * Check if the data file is existed or not. If not a new file will be created
     * @private
     * @param fileType
     * @returns {Promise}
     */
    function checkDataFiles( path, fileType ) {
        path = path + fileType + '.json';
        return new Promise( function( resolve ) {
            fs.stat( path, function( err, stat ) {
                if ( stat ) {
                    stat.path = path;
                    stat.err  = 1;
                    stat.default = iData[fileType]
                } else if ( err ) {
                    stat = {
                        err: err.errno,
                        path: err.path,
                        default: iData[fileType]
                    };
                }
                resolve( stat );
            } );
        } );
    }

    data.prototype = {
        /**
         * Initialize the data
         * @public
         * @returns {void}
         */
        init: function() {
            Promise.all( [
                checkDataFiles( this.path, 'categories' ),
                checkDataFiles( this.path, 'articles' )
            ]).then( function( values ) {
                values.forEach( function( value ) {
                    if ( value.err < 0 || ! value.isFile() ) {
                        fs.open( value.path, 'a', function( err, fd ) {
                            var buf = new Buffer( value.default ),
                                offset = 0,
                                len = buf.length,
                                filePosition = null;

                            fs.write( fd, buf, offset, len, filePosition, function( err, readByte ) {});
                        });
                    }
                });
            }).catch( function( error ) {
                console.log(error);
            } );

        },
        /**
         * Get the data of the article according to the file name
         * @public
         * @param key
         * @param callback
         * @returns {boolean}
         */
        get: function( key, callback ) {
            if ( typeof arguments[0] == 'function' ) {
                callback = key;
                key = 'categories';
            }

            key = key || 'categories';
            fs.readFile( this.path + key + '.json', function( err, data ) {
                var result = "[]";

                if ( err ) {
                    log.info( result );
                } else {
                    result = data.toString();
                    result = result || '[]';
                }

                callback( JSON.parse( result ) );

                return true;
            });
        },

        set: function( key, data, callback, ext ) {
            if ( typeof arguments[0] == 'function' || typeof arguments[0] == 'object' ) {
                key = key || 'categories';
            }

            key = key || 'categories';
            ext = ext || '.json';

            fs.writeFile( this.path + key + ext, data, function( err ) {
                if ( err ) {
                    log.info( JSON.stringify( err ) );
                }

                callback( err );
            });
        },

        isExisted: function( key ) {
            let data = new Promise( ( resolve ) => {
                this.get( key, function( data ) {
                    var has = false;

                    if ( data && data.total > 0 ) {
                        has = true;
                    }

                    resolve( has );
                });
            });

            return data;
        },
        /**
         * Retrieve the data of the article content
         * @param String file  Some text file
         * @param Function callback
         * @returns {boolean}
         */
        getText: function( file, callback ) {
            let result = {
                msg: '',
                success: false,
                data: ''
            };

            if ( ! Helper.isString( file ) || Helper.isEmpty( file ) ) {
                callback( result );
                return false;
            }

            fs.readFile( this.path + file, function( err, data ) {
                if ( err ) {
                    log.info( JSON.stringify( err ) );
                } else {
                    result.data = data.toString();
                }

                callback( result );
            });

            return true;
        },
        /**
         * Method to get all the data of the site config
         * @public
         * @param String file  The path that need to read from 
         * @return Object  Convert xml to a object instance 
         */
        getConfig( file ) {
            file = file || 'config.xml'; 

            let xml  = et.XML, 
                data = fs.readFileSync( this.path + file ).toString(),
                root  = xml( data ),
                children = root.getchildren(),
                res = {}; 

            children.forEach( function( value, index ) { 
                 let items = value.getchildren();
                 res[value.tag] = [];

                 if ( items.length > 0 ) {
                     for ( let i = 0; i < items.length; i++ ) {
                         let val = {};
                         val[items[i].tag] = items[i].text;
                         Object.assign( val, items[i].attrib );
                         res[value.tag].push( val );
                     }
                 } 
            });       

            return res;  
        },
        /**
         * Method to get the value of the global configuration
         * @public
         * @param key String  Need to find the value through the config key
         * @param type String Need to find the data through the config type
         * @return {String}  If not found, return undefined or the value of the specific key
         */
        getConfigParamVal: function( key, type ) {
            if ( ! key ) {
                return {};
            }

            let config = this.getConfig(),
                val;

            if ( type && Helper.isString( type ) ) {
                let item = config[type] || [];
                return search( item );
            } 

            for ( let v in config ) {
                 val = search( config[v] );

                 if ( val ) {
                     break;
                 }
            }

            function search( items ) {
               let checked,
                   len = items.length,
                   brk = false, i;

               for ( i = 0; i < len; i++ ) {
                    if ( brk ) break;
                    for ( let v in items[i] ) { 
                        if ( v === key ) {
                            brk = true;
                            checked = items[i][v];
                            break;    
                        }
                    }
                } 

                return checked;          
            }

            return val;
        },
        /**
         * Method to modify the value of the site config 
         * @public
         * @param Object params
         * @return Object
         */
        setConfigParams: function( params ) {
            let ElementTree = et.ElementTree,
                Element = et.Element,
                elem = new Element( 'configuration', {} ),
                subElem = et.SubElement,
                tree,
                item,
                text = '',
                subIndex,
                res = {success: false, message: ''}; 

            for ( let p in params ) {
                subIndex = subElem( elem, p );
                if ( Array.isArray( params[p] ) ) {
                    let key = '', keys = [];
                    params[p].forEach( function( value, index ) {
                        keys = Object.keys( value );
                        key  = keys[0];
                        text = value[key];
                        delete value[key];

                        item = subElem( subIndex, key, value );   
                        item.text = text;
                    });
                }
            }        

            try {
                fs.writeFileSync( this.path + 'config.xml', this.formatXml( new ElementTree( elem ).write() ) );
                res.success = true;
                res.message = 'OK';
            } catch ( e ) {
                res.message = e;
            }
            
            return res;
        },
        /**
         * Method to format a xml text and format it
         * @public
         * @param String text
         * @return String 
         */
        formatXml: function( text ) {
            // 去掉多余空格
            text = '\n' + text.replace( /(<\w+)(\s.*?>)/g, function( $0, name, props ) {
                return name + ' ' + props.replace( /\s+(\w+=)/g, " $1" );    
            }).replace( />\s*?</g, ">\n<" );  

            //把注释编码
            text = text.replace( /\n/g, '\r' ).replace( /<!--(.+?)-->/g, function($0, text) {
                return '<!--' + escape( text ) + '-->';
            }).replace( /\r/g, '\n' );  

            //调整格式
            var rgx = /\n(<(([^\?]).+?)(?:\s|\s*?>|\s*?(\/)>)(?:.*?(?:(?:(\/)>)|(?:<(\/)\2>)))?)/mg;
            var nodeStack = [];
            var output = text.replace(rgx,function($0,all,name,isBegin,isCloseFull1,isCloseFull2 ,isFull1,isFull2){
                var isClosed = (isCloseFull1 == '/') || (isCloseFull2 == '/' ) || (isFull1 == '/') || (isFull2 == '/');
                var prefix = '';
                if(isBegin == '!') {
                    prefix = getPrefix(nodeStack.length);
                }
                else {
                    if(isBegin != '/') {
                        prefix = getPrefix(nodeStack.length);
                        if(!isClosed) {
                            nodeStack.push(name);
                        }
                    }
                    else {
                        nodeStack.pop();
                        prefix = getPrefix(nodeStack.length);
                    }
                }
                
                return  '\n' + prefix + all;
            });

            var prefixSpace = -1;
            var outputText = output.substring(1);
            //alert(outputText);

            //把注释还原并解码，调格式
            outputText = outputText.replace(/\n/g,'\r').replace(/(\s*)<!--(.+?)-->/g,function($0, prefix,  text)
            {
                //alert(['[',prefix,']=',prefix.length].join(''));
                if(prefix.charAt(0) == '\r')
                    prefix = prefix.substring(1);
                text = unescape(text).replace(/\r/g,'\n');
                var ret = '\n' + prefix + '<!--' + text.replace(/^\s*/mg, prefix ) + '-->';
                //alert(ret);
                return ret;
            });

            function getPrefix( prefixIndex ) {
                var span = '    ';
                var output = [];
                for( var i = 0 ; i < prefixIndex; ++i ) {
                    output.push(span);
                }

                return output.join('');
            }     

            return outputText.replace(/\s+$/g,'').replace(/\r/g,'\r\n');
        }
    };

    return data;
})();

module.exports = new DataHelper();