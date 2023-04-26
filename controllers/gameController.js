const router = require("express").Router();
const { auth, isAuth } = require("../middlewares/authMiddleware");
const gameService = require("../services/gameService");

router.get("/", (req, res) => {
  res.render("home");
});

router.get("/catalog", async (req, res) => {
  try {
    const games = await gameService.getAll();
    console.log(games);
    
    res.render("catalog", {games});
    
  } catch (error) {
    res.render("404", error);
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
    res.render("404", error);
  }
});

router.get("/create", isAuth, (req, res) => {
  res.render("create");
});
router.post("/create", isAuth, async (req, res) => {
  try {
    const game = req.body;
    await gameService.create(game, req.user._id);
// console.log(Object.values(res.errors).map(x => x.message));
    res.redirect("/catalog");
  } catch (error) {
    console.log('#################################################################', error);
    
    res.render("404", error);
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
    res.render("404", error);
  }
});

router.get("/buy/:id", isAuth, async (req, res) => {
  try {
    const curGame = await gameService.getById(req.params.id);
    curGame.boughtBy.push(req.user._id);

    await gameService.edit(curGame._id, curGame);
    res.redirect(`/catalog/${req.params.id}`);
  } catch (error) {
    res.render("404", error);
  }
});

router.all('/search', isAuth, async (req, res) => {
  try {
    let games = await gameService.getAll();
    const query = Object.values(req.body).filter(x => x != '')
    
    if (query.length == 2) {
      //ако имаш 2 параметъра, тогава първия(name) ще е на 0 индекс а втория (platform) щe e na 1
       games = games.filter(x => x.name.toLowerCase().includes(query[0].toLowerCase()) && x.platform == query[1])
    }else if(query.length == 1) {
      //ако имаш само един параметър той винаги ще е на нулева позиция, независимо дали ще е "name" или "platform"
      games = games.filter(x => x.name.toLowerCase().includes(query[0].toLowerCase()) || x.platform == query[0])
    }
    res.render("search", {games});
  } catch (error) {
    console.log(error);
    
    res.render("404", error);
  }
})

module.exports = router;
