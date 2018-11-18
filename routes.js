module.exports = function (app, redFabric) {
   
    /**
     * GET all laptops
     */
    app.get("/api/laptops", function (req, res) {
        redFabric.init().then(function() {
          return redFabric.queryAllLaptops()
        }).then(function (data) {
          res.status(200).json(data)
        }).catch(function(err) {
          res.status(500).json({error: err.toString()})
        })
    });

    /**
     * GET laptop : id
     */
    app.get("/api/laptop/:id", function (req, res) {
      var id = req.params.id;
      redFabric.init().then(function() {
        return redFabric.queryLaptop(id)
      }).then(function (data) {
        res.status(200).json(data)
      }).catch(function(err) {
        res.status(500).json({error: err.toString()})
      })
  });

  /**
     * DELETE laptop : id
     */
    app.delete("/api/laptop/:id", function (req, res) {
      var id = req.params.id;
      redFabric.init().then(function() {
        return redFabric.deleteLaptop(id)
      }).then(function (data) {
        res.status(200).json(data)
      }).catch(function(err) {
        res.status(500).json({error: err.toString()})
      })
  });

    /**
     * POST -> add laptop
     */
    app.post("/api/laptop", function (req, res) {
      var laptops = null
      redFabric.init().then(function() {
        return redFabric.queryAllLaptops()
      }).then(function (data) {
        laptops = data;
        var count = Object.keys(laptops).length;
        var num = parseInt(laptops[count-1]['Key'].replace('LAP',''),10)+1;
        var id = 'LAP'+num;
        var laptop = {
          id : id,
          marca : req.body.marca,
          modelo : req.body.modelo,
          color : req.body.color,
          propietario : req.body.propietario
        };
        redFabric.init().then(function() {
          return redFabric.add_laptop(laptop)
        }).then(function (data) {
          res.status(200).json(data)
        }).catch(function(err) {
          res.status(500).json({error: err.toString()})
        })
      }).catch(function(err) {
        res.status(500).json({error: err.toString()})
      })
    });

    /**
     * PUT -> update laptop
     */
    app.put("/api/laptop/:id", function (req, res) {
      var id = req.params.id;
      var laptop = {
        id : id,
        marca : req.body.marca,
        modelo : req.body.modelo,
        color : req.body.color,
        propietario : req.body.propietario
      };
      redFabric.init().then(function() {
        return redFabric.add_laptop(laptop)
      }).then(function (data) {
        res.status(200).json(data)
      }).catch(function(err) {
        res.status(500).json({error: err.toString()})
      })
    });


};