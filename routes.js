module.exports = function (app, redFabric) {
   
    /**
     * GET all laptops
     */
    app.get("/api/laptops", function (req, res) {
        //gestorFabric.get_all_laptops(req, res);

        redFabric.init().then(function() {
          return redFabric.queryAllLaptops()
        }).then(function (data) {
          res.status(200).json(data[0].toString())
        }).catch(function(err) {
          res.status(500).json({error: err.toString()})
        })
    });

};