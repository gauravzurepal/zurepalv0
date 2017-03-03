/**
 * Created by root on 3/3/17.
 */
const NodeCache = require( "node-cache" );
const globalCache = new NodeCache();

module.exports = {
    put: function(key, value) {
        globalCache.set(key, value);
    },
    get: function(key) {
        return globalCache.get(key);
    }
};