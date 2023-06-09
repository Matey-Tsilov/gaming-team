const router = require("express").Router();
const { auth, isAuth } = require("../middlewares/authMiddleware");
const gameService = require("../services/gameService");

router.get("/", (req, res) => {
  res.render("home");
});

router.get("/catalog", async (req, res) => {
  try {
    const games = await gameService.getAll();
    
    res.render("catalog", {games});
    
  } catch (error) {
    res.render("404", {error: error.message});
  }
});
router.get("/catalog/:id", async (req, res) => {
  try {
    const curGame = await gameService.getById(req.params.id);

    curGame.isGuest = req.user == undefined;
    curGame.isOwner = req.user && curGame.owner == req.user._id;
    curGame.hasBought =
      !curGame.isOwner &&
      curGame.boughtBy?.map((x) => x.valueOf()).includes(req.user?._id);

    res.render("details", curGame);
  } catch (error) {

    res.render("404", {error: error.message});
  }
});

router.get("/create", isAuth, (req, res) => {
  res.render("create");
});
router.post("/create", isAuth, async (req, res) => {
  try {
    const game = req.body;

    await gameService.create(game, req.user._id);
    res.redirect("/catalog");
  } catch (error) {
    
    const errors = Object.values(error.errors).map(x => x.message)
    res.render("create", {error: errors[0]});
  }
});

router.get("/edit/:id", isAuth, async (req, res) => {
  try {
    const curGame = await gameService.getById(req.params.id);
    res.render("edit", curGame);
  } catch (error) {
    res.render("404", error);
  }
});
router.post("/edit/:id", isAuth, async (req, res) => {
  try {
    const newGame = req.body;
    const id = req.params.id;

    await gameService.edit(id, newGame);
    res.redirect(`/catalog/${id}`);
  } catch (error) {
    const errors = Object.values(error.errors).map(x => x.message)
    res.render("404", {error: errors[0]});
  }
});

router.get("/delete/:id", isAuth, async (req, res) => {
  try {
    await gameService.delete(req.params.id);
    res.redirect("/catalog");
  } catch (error) {
    res.render("404", {error: error.message});
  }
});

router.get("/buy/:id", isAuth, async (req, res) => {
  try {
    const curGame = await gameService.getById(req.params.id);
    curGame.boughtBy.push(req.user._id);

    await gameService.edit(curGame._id, curGame);
    res.redirect(`/catalog/${req.params.id}`);
  } catch (error) {
    res.render("404", {error: error.message});
  }
});

router.all('/search', isAuth, async (req, res) => {
  try {
    const query = {...req.body}
    const games = await gameService.getAll(query)

    res.render("search", {games});
  } catch (error) {
    res.render("404", {error: error.message});
  }
})

module.exports = router;
