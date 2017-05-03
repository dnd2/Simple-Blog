'use strict';
const Utils = require( '../data' ),
      cObj  = Object.create( null );      
/**
 * Class to retrieve the instance of the class
 * 
 * @Author Michael
 * @Date 2017.05.03
 * @Version 1.0.0
 */
class DataFactory {
    constructor( type ) {
        this.type = Utils.getConfigParamVal( 'site_db' ) || 'file'; 
    }
    /**
     * Method to get the instance of the specific class
     * @public
     * @param {*} instanceType 
     * @return {Object}
     */
    getInstance( instanceType ) {
        instanceType = instanceType || 'category';

        if ( cObj[instanceType] ) {
            return cObj[instanceType];
        }

        let instance = Func[this.type][instanceType];
        cObj[instanceType] = instance;
        return instance;
    }  
}

let Func = {
    db: function() {
        return {
            article: require( '../models/article' ),
            category: require( '../models/category' )
        };
    },

    file: function() {
        return {
            article: require( '../category' ),
            category: require( '../category' )
        }
    }
}

module.exports = new DataFactory();