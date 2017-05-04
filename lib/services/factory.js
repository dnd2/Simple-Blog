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
     * @param {*} instanceType The specific class need to invoke
     * @return {Object}
     */
    getInstance( instanceType ) {
        if ( ! instanceType || typeof instanceType != 'string' ) {
            instanceType = false;
        }

        if ( cObj[this.type] ) {
            return instanceType ? cObj[this.type][instanceType]() : cObj[this.type]();
        }

        cObj[this.type] = instanceType ? Func[this.type][instanceType] : Func[this.type];
        return cObj[this.type]();
    }  
}

let Func = {
    db: function() {
        let Cate = require( '../models/category' ),
            Art  = require( '../models/article' );
        return {
            article: new Art(),
            category: new Cate()
        };
    },

    file: function() {
        let Cate = require( '../category' ),
            Art  = require( '../article' );
        return {
            article: new Art(),
            category: new Cate()
        }
    }
}

module.exports = new DataFactory();