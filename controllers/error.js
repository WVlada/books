exports.get404 = (re,res,next) => {
    res.status(404).render("404", { pageTitle: "Page not found", path: "/" });
}
exports.get500 = (re,res,next) => {
    res.status(500).render("/500", { pageTitle: "Service unavailable", path: "/500" });
}