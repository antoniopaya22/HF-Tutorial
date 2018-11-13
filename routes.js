module.exports = function (app, gestorFabric) {
    
    /**
     * GET all laptops
     */
    app.get("/api/laptops", function (req, res) {
        gestorFabric.get_all_laptops(req, res);
    });

};