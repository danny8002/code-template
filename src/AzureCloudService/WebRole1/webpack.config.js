
module.exports = {
    context: __dirname,
    entry: {
        trace: ['']
    },
    output: {
        path: __dirname + "/public",
        filename: "[name].bundle.js"
    },
    module:{
        loaders:[
            {
                
            }
        ]
    }
};