module.exports = function (app, redFabric) {
   
    /**
     * GET all laptops
     */
    app.get("/api/laptops", function (req, res) {
        //gestorFabric.get_all_laptops(req, res);

        redFabric.init().then(function() {
          return redFabric.queryAllLaptops()
        }).then(function (data) {
          res.status(200).json(JSON.parse(data[0].toString()))
        }).catch(function(err) {
          res.status(500).json({error: err.toString()})
        })
    });

    /**
     * POST -> add laptop
     */
    app.post("/api/laptop", function (req, res) {
      redFabric.init().then(function() {
        return redFabric.add_laptop()
      }).then(function (data) {
        res.status(200).json(JSON.parse(data[0].toString()))
      }).catch(function(err) {
        res.status(500).json({error: err.toString()})
      })
    });

};